import { ChartContainer } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
  ReferenceLine,
} from "recharts";

interface ActionExecutionTimeChartProps {
  data: Record<string, number>;
  // Optional mapping of IDs to display names
  nameMapping?: Record<string, string>;
}

export function ActionExecutionTimeChart({
  data,
  nameMapping = {},
}: ActionExecutionTimeChartProps) {
  // Convert data to bar chart format with display names
  const chartData = Object.entries(data)
    .map(([id, executionTime]) => ({
      id,
      name: nameMapping[id] || id,
      executionTime: Math.round(executionTime * 100) / 100, // Round to 2 decimal places
    }))
    .sort((a, b) => b.executionTime - a.executionTime) // Sort by execution time (descending)
    .slice(0, 10); // Take top 10

  // Calculate average execution time across displayed actions
  const avgExecutionTime =
    chartData.length > 0
      ? Math.round(
          (chartData.reduce((sum, item) => sum + item.executionTime, 0) /
            chartData.length) *
            100
        ) / 100
      : 0;

  // Generate config for chart colors using CSS variables
  const chartConfig = {
    executionTime: {
      label: "Execution Time (ms)",
      theme: {
        light: "hsl(221.2 83.2% 53.3%)", // Blue-600
        dark: "hsl(217.2 91.2% 59.8%)", // Blue-500
      },
    },
    average: {
      label: "Average",
      theme: {
        light: "hsl(0 72.2% 50.6%)", // Red-600
        dark: "hsl(0 72.2% 50.6%)", // Red-600
      },
    },
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      {Object.keys(data).length === 0 ? (
        <p className="text-muted-foreground text-center">No data available</p>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 150, bottom: 20 }}
            barSize={20}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              opacity={0.6}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              domain={[
                0,
                (dataMax: number) =>
                  Math.max(dataMax * 1.1, avgExecutionTime * 1.5),
              ]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentFromAvg =
                    avgExecutionTime > 0
                      ? Math.round(
                          (data.executionTime / avgExecutionTime - 1) * 100
                        )
                      : 0;

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="mb-2 font-semibold">{data.name}</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-sm bg-[hsl(221.2_83.2%_53.3%)]" />
                            <span className="text-sm">Execution Time</span>
                          </div>
                          <span className="font-medium tabular-nums">
                            {data.executionTime.toLocaleString()} ms
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Average</span>
                            <span className="font-medium tabular-nums">
                              {avgExecutionTime.toLocaleString()} ms
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-medium">
                              Difference
                            </span>
                            <span
                              className={`font-medium tabular-nums ${
                                percentFromAvg > 0
                                  ? "text-destructive"
                                  : percentFromAvg < 0
                                  ? "text-success"
                                  : ""
                              }`}
                            >
                              {percentFromAvg > 0 ? "+" : ""}
                              {percentFromAvg}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            />
            <ReferenceLine
              x={avgExecutionTime}
              stroke="var(--color-average)"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${avgExecutionTime} ms`,
                position: "insideBottomRight",
                fill: "var(--color-average)",
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="executionTime"
              name="Execution Time"
              fill="var(--color-executionTime)"
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="executionTime"
                position="right"
                formatter={(value: number) => `${value} ms`}
                style={{
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
                offset={5}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
