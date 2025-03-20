import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pb } from "@/lib/pocketbase";
import { PermissionsResponse, UsersResponse } from "@/types/db.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast";

export function PermissionsSettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch permissions
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const records = await pb
        .collection("permissions")
        .getFullList<PermissionsResponse>();
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

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (data: { name: string; users: string[] }) => {
      return await pb.collection("permissions").create(data);
    },
    onSuccess: () => {
      toast.success({
        message: "Permission created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setIsAddDialogOpen(false);
      setNewPermissionName("");
      setSelectedUsers([]);
    },
    onError: (error) => {
      console.error("Error creating permission:", error);
      toast.error({
        message: "Failed to create permission",
      });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: { id: string; users: string[] }) => {
      return await pb
        .collection("permissions")
        .update(data.id, { users: data.users });
    },
    onSuccess: () => {
      toast.success({
        message: "Permission updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error) => {
      console.error("Error updating permission:", error);
      toast.error({
        message: "Failed to update permission",
      });
    },
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pb.collection("permissions").delete(id);
    },
    onSuccess: () => {
      toast.success({
        message: "Permission deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error) => {
      console.error("Error deleting permission:", error);
      toast.error({
        message: "Failed to delete permission",
      });
    },
  });

  const handleCreatePermission = () => {
    if (!newPermissionName.trim()) {
      toast.error({
        message: "Permission name is required",
      });
      return;
    }

    createPermissionMutation.mutate({
      name: newPermissionName.trim(),
      users: selectedUsers,
    });
  };

  const handleUpdatePermission = (id: string, users: string[]) => {
    updatePermissionMutation.mutate({ id, users });
  };

  const handleDeletePermission = (id: string) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      deletePermissionMutation.mutate(id);
    }
  };

  const handleUserSelectionChange = (
    permissionId: string,
    userId: string,
    isSelected: boolean
  ) => {
    const permission = permissions?.find((p) => p.id === permissionId);
    if (!permission) return;

    const updatedUsers = isSelected
      ? [...permission.users, userId]
      : permission.users.filter((id) => id !== userId);

    handleUpdatePermission(permissionId, updatedUsers);
  };

  if (isLoadingPermissions || isLoadingUsers) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (permissionsError || usersError) {
    return (
      <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Permissions</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>
                Add a new permission and assign users to it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
                  value={newPermissionName}
                  onChange={(e) => setNewPermissionName(e.target.value)}
                  placeholder="e.g., admin, editor, viewer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="users">Assign Users</Label>
                <Select
                  onValueChange={(value) => {
                    if (!selectedUsers.includes(value)) {
                      setSelectedUsers([...selectedUsers, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select users" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUsers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <Label>Selected Users</Label>
                    <div className="flex flex-wrap gap-2">
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
                              className="text-secondary-foreground/70 hover:text-secondary-foreground"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePermission}
                disabled={createPermissionMutation.isPending}
              >
                {createPermissionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Permission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="shadow-2xl rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No permissions found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                permissions?.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      {permission.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {users?.map((user) => {
                          const isAssigned = permission.users.includes(user.id);
                          return (
                            <div
                              key={user.id}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer ${
                                isAssigned
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                              onClick={() =>
                                handleUserSelectionChange(
                                  permission.id,
                                  user.id,
                                  !isAssigned
                                )
                              }
                            >
                              <span>{user.name || user.email}</span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePermission(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>Click on a user to toggle their permission assignment.</p>
      </div>
    </div>
  );
}
