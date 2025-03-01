import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { DeviceResponse } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters"),
  configuration: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    ipAddress: z.string().ip("Must be a valid IP address"),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddDeviceModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      configuration: {
        name: "",
        ipAddress: "",
      },
    },
  });

  const { data: sourceTemplate } = useQuery({
    queryKey: ["source"],
    queryFn: async () => {
      const template = await pb
        .collection("configurations")
        .getFirstListItem<{ value: { template: string } }>("name = 'source'");

      return template.value.template;
    },
  });

  const { mutate: addCamera, isPending } = useMutation({
    mutationFn: async ({ configuration, ...data }: FormValues) => {
      if (!sourceTemplate) {
        throw new Error("Source template must be set in the db.");
      }

      const sourceUrl = sourceTemplate
        .replace("<ip>", configuration.ipAddress)
        .replace("<id>", configuration.name);
      const configWithSource = {
        name: configuration.name,
        source: sourceUrl,
      };

      return pb.collection("devices").create<DeviceResponse>({
        ...data,
        configuration: configWithSource,
        automation: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device added successfully");
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to add device: " + error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    addCamera(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-2">
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  {...form.register("nickname")}
                  className={cn(
                    form.formState.errors.nickname && "border-destructive"
                  )}
                />
                {form.formState.errors.nickname && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nickname.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Device ID</Label>
                <Input
                  id="name"
                  placeholder="Enter the device 4 digit ID"
                  {...form.register("configuration.name")}
                  className={cn(
                    form.formState.errors.configuration?.name &&
                      "border-destructive"
                  )}
                />
                {form.formState.errors.configuration?.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.configuration.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  {...form.register("configuration.ipAddress")}
                  className={cn(
                    form.formState.errors.configuration?.ipAddress &&
                      "border-destructive"
                  )}
                />
                {form.formState.errors.configuration?.ipAddress && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.configuration.ipAddress.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Add Device
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
