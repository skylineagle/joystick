import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/phone-input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { ModelsResponse } from "@/types/db.types";
import { DeviceResponse } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { Country } from "react-phone-number-input";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  deviceType: z.string().min(1, "Device type is required"),
  configuration: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    ipAddress: z.string().ip("Must be a valid IP address"),
  }),
  information: z.object({
    user: z.string().min(1, "User is required"),
    password: z.string().min(1, "Password is required"),
    phone: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddDeviceModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      deviceType: "",
      configuration: {
        name: "",
        ipAddress: "",
      },
      information: {
        user: "",
        password: "",
        phone: "",
      },
    },
  });
  const { data: defaultCountry } = useQuery({
    queryKey: ["default-country", form.getValues("deviceType")],
    queryFn: async () => {
      const country = await pb
        .collection("templates")
        .getFirstListItem(`name = "country"`);

      return country;
    },
  });

  const { data: deviceModels } = useQuery({
    queryKey: ["device-models"],
    queryFn: async () => {
      const models = await pb
        .collection("models")
        .getFullList<ModelsResponse>();
      return models;
    },
  });

  const { mutate: addCamera, isPending } = useMutation({
    mutationFn: async ({
      configuration,
      information,
      deviceType,
      ...data
    }: FormValues) => {
      const sourceResult = await pb.collection("templates").getFullList({
        filter: `name = "source" && model ?~ "${deviceType}"`,
      });

      if (!sourceResult || sourceResult.length !== 1) {
        throw new Error("Source template must be set in the db.");
      }

      const sourceTemplate = sourceResult[0];
      const sourceUrl = sourceTemplate.value
        .replace("<ip>", configuration.ipAddress)
        .replace("<id>", configuration.name);

      const configWithSource = {
        name: configuration.name,
        source: sourceUrl,
      };

      return pb.collection("devices").create<DeviceResponse>({
        ...data,
        device: deviceType,
        configuration: configWithSource,
        information: {
          ...information,
          phone:
            information?.phone?.length === 13 ? information.phone : undefined,
          host: configuration.ipAddress,
        },
        mode: "off",
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  className={cn(
                    form.formState.errors.name && "border-destructive"
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("deviceType", value)}
                  defaultValue={form.getValues("deviceType")}
                >
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.deviceType && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceModels?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.deviceType && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.deviceType.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
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

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Device Information</h3>
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="user">User</Label>
                  <Input
                    id="user"
                    {...form.register("information.user")}
                    className={cn(
                      form.formState.errors.information?.user &&
                        "border-destructive"
                    )}
                  />
                  {form.formState.errors.information?.user && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.information.user.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("information.password")}
                    className={cn(
                      form.formState.errors.information?.password &&
                        "border-destructive"
                    )}
                  />
                  {form.formState.errors.information?.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.information.password.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <RPNInput.default
                  className="flex rounded-md shadow-xs"
                  international
                  flagComponent={FlagComponent}
                  defaultCountry={defaultCountry?.value as Country}
                  countrySelectComponent={CountrySelect}
                  inputComponent={PhoneInput}
                  id="phone"
                  placeholder="Enter phone number"
                  value={form.getValues("information.phone")}
                  onChange={(value) =>
                    form.setValue("information.phone", value ?? "")
                  }
                />
                {form.formState.errors.information?.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.information.phone.message}
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
