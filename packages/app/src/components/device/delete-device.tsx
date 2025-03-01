import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDevice } from "@/lib/device";
import { DeviceResponse } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "@/utils/toast";

export function DeleteDevice({ device }: { device: DeviceResponse }) {
  const queryClient = useQueryClient();
  const { mutate: deleteDeviceMutation } = useMutation({
    mutationFn: async (id: string) => {
      await deleteDevice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success({ message: "Device deleted successfully" });
    },
    onError: (error) => {
      toast.error({ message: "Failed to delete device: " + error.message });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash2 className="h-4 w-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the device and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteDeviceMutation(device.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
