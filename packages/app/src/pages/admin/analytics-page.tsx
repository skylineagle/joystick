import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateActionAnalytics } from "@/lib/analytics";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Filter, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { ActionOverviewChart } from "./action-overview-chart";
import { ActionSuccessRateChart } from "./action-success-rate-chart";
import { ActionExecutionTimeChart } from "./action-execution-time-chart";
import { DatePickerWithRange } from "./date-range-picker";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { urls } from "@/lib/urls";
import { UserProfile } from "@/components/user-profile";

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState<{
    actionId?: string;
    deviceId?: string;
    userId?: string;
    status?: string;
    executionTimeRange?: { min?: number; max?: number };
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }>({});

  // Calculate days from date range
  const getDaysFromDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return parseInt(timeRange);

    const diffTime = Math.abs(
      dateRange.to.getTime() - dateRange.from.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Query for analytics data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["actionAnalytics", timeRange, dateRange, filters],
    queryFn: () => calculateActionAnalytics(getDaysFromDateRange(), filters),
    refetchOnWindowFocus: false,
  });

  // Extract name mappings from data
  const getNameMappings = useCallback(() => {
    if (!data) return {};

    // Extract action names from all actions (complete list)
    const actionNameMappings: Record<string, string> = {};

    // First, add mappings from all actions
    if (data.allActions) {
      data.allActions.forEach((action) => {
        if (action.id && action.name) {
          actionNameMappings[action.id] = action.name;
        }
      });
    }

    // Then add/update from recent actions (might have more up-to-date names)
    data.recentActions.forEach((log) => {
      if (log.expand?.action?.name && log.action) {
        actionNameMappings[log.action] = log.expand.action.name;
      }
    });

    // Extract device names
    const deviceNameMappings: Record<string, string> = {};
    data.recentActions.forEach((log) => {
      if (log.expand?.device?.name && log.device) {
        deviceNameMappings[log.device] = log.expand.device.name;
      }
    });

    // Extract user names
    const userNameMappings: Record<string, string> = {};
    data.recentActions.forEach((log) => {
      if (log.expand?.user?.name && log.user) {
        userNameMappings[log.user] = log.expand.user.name;
      } else if (log.expand?.user?.username && log.user) {
        userNameMappings[log.user] = log.expand.user.username;
      }
    });

    return {
      actions: actionNameMappings,
      devices: deviceNameMappings,
      users: userNameMappings,
    };
  }, [data]);

  // Apply date range as custom filter
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setTimeRange("custom");
    }
  }, [dateRange]);

  // Get unique options for dropdowns
  const getFilterOptions = useCallback(() => {
    if (!data) return { actions: [], devices: [], users: [], statuses: [] };

    const actions = new Set<string>();
    const devices = new Set<string>();
    const users = new Set<string>();
    const statuses = new Set<string>();

    data.recentActions.forEach((log) => {
      if (log.action) actions.add(log.action);
      if (log.device) devices.add(log.device);
      if (log.user) users.add(log.user);
      if (log.result?.success)
        statuses.add(log.result?.success ? "success" : "error");
    });

    return {
      actions: Array.from(actions),
      devices: Array.from(devices),
      users: Array.from(users),
      statuses: Array.from(statuses),
    };
  }, [data]);

  // Handle filter reset
  function handleResetFilters() {
    setFilters({});
    setDateRange(undefined);
    setTimeRange("30");
  }

  function handleRemoveFilter(key: string) {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key as keyof typeof filters];
      return newFilters;
    });
  }

  // Execution time range filter
  const [minExecutionTime, setMinExecutionTime] = useState<string>("");
  const [maxExecutionTime, setMaxExecutionTime] = useState<string>("");

  const applyExecutionTimeFilter = () => {
    const min = minExecutionTime ? parseInt(minExecutionTime) : undefined;
    const max = maxExecutionTime ? parseInt(maxExecutionTime) : undefined;

    if (min !== undefined || max !== undefined) {
      setFilters((prev) => ({
        ...prev,
        executionTimeRange: { min, max },
      }));
    }
  };

  // Get name mappings
  const nameMappings = React.useMemo(
    () => getNameMappings(),
    [getNameMappings]
  );

  // Get filter options
  const filterOptions = React.useMemo(
    () => getFilterOptions(),
    [getFilterOptions]
  );

  // Helper function to get badge variant
  const getStatusBadgeVariant = (
    success?: boolean
  ): "default" | "destructive" | "outline" | "secondary" => {
    if (success) return "default";
    if (!success) return "destructive";
    return "outline";
  };

  // Helper to format the execution time range display
  const formatExecutionTimeRange = (range: { min?: number; max?: number }) => {
    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min}ms - ${range.max}ms`;
    }
    if (range.min !== undefined) {
      return `≥ ${range.min}ms`;
    }
    if (range.max !== undefined) {
      return `≤ ${range.max}ms`;
    }
    return "";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button onClick={() => refetch()} disabled={isLoading}>
            Refresh Data
          </Button>
          <AnimatedThemeToggle />
          <UserProfile />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle>Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            {timeRange === "custom" && (
              <div className="mt-2">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Filters</CardTitle>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Add Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Device</h4>
                      <Select
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, deviceId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.devices.map((id) => (
                            <SelectItem key={id} value={id}>
                              {nameMappings.devices?.[id] || id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Action</h4>
                      <Select
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, actionId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.actions.map((id) => (
                            <SelectItem key={id} value={id}>
                              {nameMappings.actions?.[id] || id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">User</h4>
                      <Select
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, userId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.users.map((id) => (
                            <SelectItem key={id} value={id}>
                              {nameMappings.users?.[id] || id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Status</h4>
                      <Select
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Execution Time (ms)</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minExecutionTime}
                          onChange={(e) => setMinExecutionTime(e.target.value)}
                          className="w-full"
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxExecutionTime}
                          onChange={(e) => setMaxExecutionTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={applyExecutionTimeFilter}
                        className="w-full mt-1"
                      >
                        Apply Range
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Sort By</h4>
                      <Select
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, sortBy: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sort field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="timestamp">Timestamp</SelectItem>
                          <SelectItem value="execution_time">
                            Execution Time
                          </SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="device">Device</SelectItem>
                        </SelectContent>
                      </Select>
                      {filters.sortBy && (
                        <Select
                          defaultValue="desc"
                          onValueChange={(value: "asc" | "desc") =>
                            setFilters((prev) => ({
                              ...prev,
                              sortDirection: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sort direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (
                  !value ||
                  (typeof value === "object" && !Object.keys(value).length)
                )
                  return null;

                let displayValue = value;
                let displayKey = key;

                // Format the display values
                switch (key) {
                  case "actionId":
                    displayKey = "Action";
                    displayValue =
                      nameMappings.actions?.[value as string] || value;
                    break;
                  case "deviceId":
                    displayKey = "Device";
                    displayValue =
                      nameMappings.devices?.[value as string] || value;
                    break;
                  case "userId":
                    displayKey = "User";
                    displayValue =
                      nameMappings.users?.[value as string] || value;
                    break;
                  case "executionTimeRange":
                    displayKey = "Execution Time";
                    displayValue = formatExecutionTimeRange(
                      value as { min?: number; max?: number }
                    );
                    break;
                  case "sortBy":
                    displayKey = "Sort";
                    displayValue = `${value} ${
                      filters.sortDirection || "desc"
                    }`;
                    break;
                  case "sortDirection":
                    return null; // Skip sort direction as it's shown with sortBy
                }

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="py-1 px-2 gap-1"
                  >
                    <span className="font-semibold">{displayKey}:</span>{" "}
                    {displayValue as React.ReactNode}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => handleRemoveFilter(key)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}

              {Object.keys(filters).some(
                (key) =>
                  filters[key as keyof typeof filters] !== undefined &&
                  !(key === "sortDirection" && filters.sortBy === undefined)
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7"
                >
                  Clear All
                </Button>
              )}

              {Object.keys(filters).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No filters applied. Click "Add Filter" to filter the data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-destructive">
              <p>Error loading analytics data.</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalActions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.keys(data.actionsByType).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.keys(data.actionsByDevice).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Execution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.averageExecutionTime.toFixed(2)}ms
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recent">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="recent">Recent Actions</TabsTrigger>
              <TabsTrigger value="details">Action Details</TabsTrigger>
              <TabsTrigger value="overview">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle>Actions by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ActionOverviewChart
                      data={data.actionsByType}
                      nameMapping={nameMappings.actions}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle>Actions by Device</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ActionOverviewChart
                      data={data.actionsByDevice}
                      nameMapping={nameMappings.devices}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle>Actions Success Rate</CardTitle>
                    <CardDescription>
                      Success vs. failure rates for most used actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {Object.keys(data.actionSuccessRates).length === 0 ? (
                      <p className="text-muted-foreground text-center">
                        No data available
                      </p>
                    ) : (
                      <ActionSuccessRateChart
                        data={data.actionSuccessRates}
                        nameMapping={nameMappings.actions}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl">
                  <CardHeader>
                    <CardTitle>Avg. Execution Time per Action</CardTitle>
                    <CardDescription>
                      Average execution time in milliseconds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {Object.keys(data.executionTimeByAction).length === 0 ? (
                      <p className="text-muted-foreground text-center">
                        No data available
                      </p>
                    ) : (
                      <ActionExecutionTimeChart
                        data={data.executionTimeByAction}
                        nameMapping={nameMappings.actions}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card className="border-none shadow-2xl">
                <CardHeader>
                  <CardTitle>Action Execution Times</CardTitle>
                  <CardDescription>
                    Average execution time per action type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Avg. Execution Time (ms)</TableHead>
                        <TableHead>% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(data.actionsByType)
                        .sort((a, b) => b[1] - a[1])
                        .map(([actionId, count]) => (
                          <TableRow key={actionId}>
                            <TableCell
                              className="font-medium cursor-pointer hover:underline"
                              onClick={() =>
                                setFilters((prev) => ({ ...prev, actionId }))
                              }
                            >
                              {nameMappings.actions?.[actionId] || actionId}
                            </TableCell>
                            <TableCell>{count}</TableCell>
                            <TableCell>
                              {data.executionTimeByAction[actionId]?.toFixed(
                                2
                              ) || "N/A"}
                            </TableCell>
                            <TableCell>
                              {((count / data.totalActions) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="mt-4">
              <Card className="border-none shadow-2xl">
                <CardHeader>
                  <CardTitle>Recent Actions</CardTitle>
                  <CardDescription>Latest recorded actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Execution Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentActions.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(
                              new Date(log.created),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </TableCell>
                          <TableCell
                            className="cursor-pointer hover:underline"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                actionId: log.action,
                              }))
                            }
                          >
                            {log.expand?.action?.name || log.action}
                          </TableCell>
                          <TableCell
                            className="cursor-pointer hover:underline flex items-center gap-2"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                userId: log.user,
                              }))
                            }
                          >
                            <Avatar className="size-5">
                              <AvatarImage
                                src={`${urls.pocketbase}/api/files/${log.expand?.user.collectionId}/${log.expand?.user.id}/${log.expand?.user.avatar}`}
                                alt={
                                  log.expand?.user.username ||
                                  log.expand?.user.email
                                }
                              />
                              <AvatarFallback>
                                {log.expand?.user?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {log.expand?.user?.name || log.user}
                          </TableCell>
                          <TableCell
                            className="cursor-pointer hover:underline"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                deviceId: log.device,
                              }))
                            }
                          >
                            {log.expand?.device?.name || log.device}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                log.result?.success
                              )}
                            >
                              {log.result?.success ? "Success" : "Error"}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.execution_time}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
