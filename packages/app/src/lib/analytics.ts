import { pb } from "@/lib/pocketbase";
import { Collections } from "@/types/db.types";
import { ActionLogsResponse, ActionResponse } from "@/types/types";

// Types for analytics data
export interface ActionAnalytics {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByDevice: Record<string, number>;
  actionsByUser: Record<string, number>;
  averageExecutionTime: number;
  executionTimeByAction: Record<string, number>;
  actionTrends: {
    date: string;
    count: number;
  }[];
  mostUsedParameters: Record<string, number>;
  recentActions: ActionLogsResponse[];
  allActions: ActionResponse[];
  actionSuccessRates: Record<string, { success: number; failure: number }>;
}

// Fetch all actions to ensure we have a complete mapping
export async function fetchAllActions() {
  try {
    const result = await pb
      .collection(Collections.Actions)
      .getFullList<ActionResponse>({
        sort: "name",
      });

    return result;
  } catch (error) {
    console.error("Error fetching all actions:", error);
    return [];
  }
}

// Fetch action logs with pagination
export async function fetchActionLogs(
  page = 1,
  perPage = 50,
  filters?: {
    fromDate?: string;
    toDate?: string;
    actionId?: string;
    deviceId?: string;
    userId?: string;
  }
) {
  try {
    let filter = "";

    if (filters) {
      const conditions = [];

      if (filters.fromDate) {
        conditions.push(`created >= "${filters.fromDate}"`);
      }

      if (filters.toDate) {
        conditions.push(`created <= "${filters.toDate}"`);
      }

      if (filters.actionId) {
        conditions.push(`action = "${filters.actionId}"`);
      }

      if (filters.deviceId) {
        conditions.push(`device = "${filters.deviceId}"`);
      }

      if (filters.userId) {
        conditions.push(`user = "${filters.userId}"`);
      }

      filter = conditions.join(" && ");
    }

    const result = await pb
      .collection(Collections.ActionLogs)
      .getList<ActionLogsResponse>(page, perPage, {
        sort: "-created",
        filter,
        expand: "action,device,user",
      });

    return result;
  } catch (error) {
    console.error("Error fetching action logs:", error);
    throw error;
  }
}

// Calculate analytics from action logs
export async function calculateActionAnalytics(
  days = 30,
  filters?: {
    actionId?: string;
    deviceId?: string;
    userId?: string;
  }
): Promise<ActionAnalytics> {
  try {
    // Calculate the date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // Fetch logs for the specified period
    const allLogs: ActionLogsResponse[] = [];
    let page = 1;
    const perPage = 200;

    let hasMore = true;
    while (hasMore) {
      const result = await fetchActionLogs(page, perPage, {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        ...filters,
      });

      allLogs.push(...result.items);

      if (result.items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }

      // Safety mechanism to prevent infinite loops
      if (page > 10) {
        hasMore = false;
      }
    }

    // Calculate analytics
    const actionsByType: Record<string, number> = {};
    const actionsByDevice: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    const executionTimeByAction: Record<string, number> = {};
    const executionTimesCount: Record<string, number> = {};
    const parameterCounts: Record<string, number> = {};
    const actionSuccessRates: Record<
      string,
      { success: number; failure: number }
    > = {};

    // Calculate date buckets for trends
    const dateMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, 0);
    }

    // Process each log
    allLogs.forEach((log) => {
      // Count by action type
      if (!actionsByType[log.action]) actionsByType[log.action] = 0;
      actionsByType[log.action]++;

      // Count by device
      if (!actionsByDevice[log.device]) actionsByDevice[log.device] = 0;
      actionsByDevice[log.device]++;

      // Count by user
      if (!actionsByUser[log.user]) actionsByUser[log.user] = 0;
      actionsByUser[log.user]++;

      // Sum execution times
      if (!executionTimeByAction[log.action]) {
        executionTimeByAction[log.action] = 0;
        executionTimesCount[log.action] = 0;
      }
      executionTimeByAction[log.action] += Number(log.execution_time) || 0;
      executionTimesCount[log.action]++;

      // Track success rates
      if (!actionSuccessRates[log.action]) {
        actionSuccessRates[log.action] = { success: 0, failure: 0 };
      }

      console.log(log?.expand?.action?.name, log.result);

      if (log.result?.success) {
        actionSuccessRates[log.action].success++;
      } else {
        actionSuccessRates[log.action].failure++;
      }

      // Trend data
      const dateStr = new Date(log.created).toISOString().split("T")[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);

      // Count parameters
      if (log.parameters) {
        Object.keys(log.parameters).forEach((param) => {
          if (!parameterCounts[param]) parameterCounts[param] = 0;
          parameterCounts[param]++;
        });
      }
    });

    // Calculate average execution times
    Object.keys(executionTimeByAction).forEach((action) => {
      executionTimeByAction[action] =
        executionTimeByAction[action] / executionTimesCount[action];
    });

    // Calculate total average execution time
    let totalExecTime = 0;
    allLogs.forEach((log) => {
      totalExecTime += Number(log.execution_time) || 0;
    });
    const averageExecutionTime = allLogs.length
      ? totalExecTime / allLogs.length
      : 0;

    // Sort parameters by frequency
    const sortedParams = Object.entries(parameterCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, number>);

    // Convert date map to array for trends
    const actionTrends = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get recent actions
    const recentActions = await fetchActionLogs(1, 10, {
      ...filters,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });

    // Fetch all actions to ensure complete mappings
    const allActions = await fetchAllActions();

    return {
      totalActions: allLogs.length,
      actionsByType,
      actionsByDevice,
      actionsByUser,
      averageExecutionTime,
      executionTimeByAction,
      actionTrends,
      mostUsedParameters: sortedParams,
      recentActions: recentActions.items,
      allActions,
      actionSuccessRates,
    };
  } catch (error) {
    console.error("Error calculating action analytics:", error);
    throw error;
  }
}
