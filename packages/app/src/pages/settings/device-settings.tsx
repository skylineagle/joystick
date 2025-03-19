import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { pb } from "@/lib/pocketbase";
import { UsersResponse } from "@/types/db.types";
import { DeviceResponse } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeviceSettings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(
    null
  );
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch devices
  const {
    data: devices,
    isLoading: isLoadingDevices,
    error: devicesError,
  } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const records = await pb
        .collection("devices")
        .getFullList<DeviceResponse>({
          expand: "device",
        });
      return records;
    },
  });

  // Fetch users
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const records = await pb.collection("users").getFullList<UsersResponse>();
      return records;
    },
  });

  // Update device visibility mutation
  const updateDeviceVisibilityMutation = useMutation({
    mutationFn: async ({ id, hide }: { id: string; hide: boolean }) => {
      return await pb.collection("devices").update(id, { hide });
    },
    onSuccess: () => {
      toast.success("Device visibility updated");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      console.error("Error updating device visibility:", error);
      toast.error("Failed to update device visibility");
    },
  });

  // Update device permissions mutation
  const updateDevicePermissionsMutation = useMutation({
    mutationFn: async ({ id, allow }: { id: string; allow: string[] }) => {
      return await pb.collection("devices").update(id, { allow });
    },
    onSuccess: () => {
      toast.success("Device permissions updated");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setIsPermissionsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating device permissions:", error);
      toast.error("Failed to update device permissions");
    },
  });

  const handleToggleVisibility = (device: DeviceResponse) => {
    updateDeviceVisibilityMutation.mutate({
      id: device.id,
      hide: !device.hide,
    });
  };

  const handleOpenPermissionsDialog = (device: DeviceResponse) => {
    setSelectedDevice(device);
    setSelectedUsers(device.allow || []);
    setIsPermissionsDialogOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedDevice) return;

    updateDevicePermissionsMutation.mutate({
      id: selectedDevice.id,
      allow: selectedUsers,
    });
  };

  const filteredDevices = devices?.filter((device) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      device.name?.toLowerCase().includes(searchLower) ||
      device.expand?.device?.name.toLowerCase().includes(searchLower) ||
      device.description?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoadingDevices || isLoadingUsers) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (devicesError || usersError) {
    return (
      <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Device Management</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardContent className="shadow-2xl rounded-md p-0">
          <div className="rounded-md overflow-hidden">
            <div className="relative">
              <div className="border-b sticky top-0 z-10 bg-background">
                <div className="flex w-full">
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[30%] text-left">
                    Device Name
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[25%] text-left">
                    Model
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[25%] text-left">
                    Visibility
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[20%] text-right">
                    Actions
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <Table className="w-full">
                  <TableBody>
                    {filteredDevices?.length === 0 ? (
                      <TableRow className="border-b hover:bg-muted/30">
                        <TableCell
                          colSpan={4}
                          className="text-center px-4 py-8 text-muted-foreground"
                        >
                          No devices found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDevices?.map((device) => (
                        <TableRow
                          key={device.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <TableCell className="p-4 w-[30%] font-medium">
                            {device.name}
                          </TableCell>
                          <TableCell className="p-4 w-[25%]">
                            {device.expand?.device?.name}
                          </TableCell>
                          <TableCell className="p-4 w-[25%]">
                            <div className="flex items-center">
                              <Switch
                                checked={!device.hide}
                                onCheckedChange={() =>
                                  handleToggleVisibility(device)
                                }
                                aria-label="Toggle visibility"
                              />
                              <span className="ml-2 text-sm">
                                {device.hide ? "Hidden" : "Visible"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="p-4 text-right w-[20%]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenPermissionsDialog(device)
                              }
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Permissions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Access Permissions</DialogTitle>
            <DialogDescription>
              {selectedDevice?.name
                ? `Manage which users can access ${selectedDevice.name}`
                : "Manage device access permissions"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Users with Access</Label>
              <Select
                onValueChange={(value) => {
                  if (!selectedUsers.includes(value)) {
                    setSelectedUsers([...selectedUsers, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUsers.length > 0 ? (
              <div className="border rounded-md p-3 space-y-2">
                <Label>Selected Users</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUsers.map((userId) => {
                    const user = users?.find((u) => u.id === userId);
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                      >
                        <span>{user?.name || user?.email}</span>
                        <button
                          onClick={() =>
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== userId)
                            )
                          }
                          className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No users selected. This device will not be accessible to any
                users.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updateDevicePermissionsMutation.isPending}
            >
              {updateDevicePermissionsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-muted-foreground">
        <p>
          Control device visibility and user access permissions. Hidden devices
          will not appear in the device list for any users.
        </p>
      </div>
    </div>
  );
}
