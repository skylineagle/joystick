import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { WifiApConfig } from "@/hooks/use-wifi-ap";
import { joystickApi, createUrl } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const configSchema = z.object({
  ssid: z.string().min(1, "SSID is required").max(32, "SSID must be 32 characters or less"),
  password: z.string().min(0),
  channel: z.coerce.number().int().min(1).max(13),
  band: z.string(),
  security: z.enum(["none", "psk", "psk2"]),
  txPower: z.number().int().min(1).max(30),
  maxClients: z.coerce.number().int().min(1).max(255),
  hidden: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

type WifiApConfigFormProps = {
  deviceId: string;
  config: WifiApConfig | undefined;
  isLoading: boolean;
  onSuccess: () => void;
};

const CHANNELS_2_4GHZ = Array.from({ length: 13 }, (_, i) => i + 1);

export const WifiApConfigForm = ({
  deviceId,
  config,
  isLoading,
  onSuccess,
}: WifiApConfigFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      ssid: "",
      password: "",
      channel: 6,
      band: "2.4GHz",
      security: "psk2",
      txPower: 20,
      maxClients: 32,
      hidden: false,
    },
  });

  useEffect(() => {
    if (!config) return;
    form.reset({
      ssid: config.ssid,
      password: config.password,
      channel: config.channel,
      band: config.band,
      security: config.security,
      txPower: config.txPower,
      maxClients: config.maxClients,
      hidden: config.hidden,
    });
  }, [config, form]);

  const handleSubmit = async (values: ConfigFormValues) => {
    setIsSubmitting(true);
    try {
      await joystickApi.put(
        createUrl(urls.joystick, `/api/wifi-ap/${deviceId}/config`),
        values
      );
      toast.success("WiFi AP configuration updated");
      onSuccess();
    } catch {
      toast.error("Failed to update WiFi AP configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const txPowerValue = form.watch("txPower");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          AP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="ssid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSID</FormLabel>
                    <FormControl>
                      <Input placeholder="Network name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Network password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={handleTogglePassword}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="security"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select security" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Open</SelectItem>
                        <SelectItem value="psk">WPA</SelectItem>
                        <SelectItem value="psk2">WPA2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="band"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Band</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select band" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2.4GHz">2.4 GHz</SelectItem>
                        <SelectItem value="5GHz">5 GHz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CHANNELS_2_4GHZ.map((ch) => (
                          <SelectItem key={ch} value={String(ch)}>
                            Channel {ch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxClients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Clients</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={255}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="txPower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    TX Power:{" "}
                    <span className="font-semibold">{txPowerValue} dBm</span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hidden"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="hidden-network"
                      />
                    </FormControl>
                    <Label htmlFor="hidden-network" className="cursor-pointer">
                      Hidden Network
                    </Label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
