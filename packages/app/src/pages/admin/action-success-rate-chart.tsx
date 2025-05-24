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
} from "recharts";

interface ActionSuccessRateChartProps {
  data: Record<string, { success: number; failure: number }>;
  // Optional mapping of IDs to display names
  nameMapping?: Record<string, string>;
}

export function ActionSuccessRateChart({
  data,
  nameMapping = {},
}: ActionSuccessRateChartProps) {
  // Convert data to bar chart format with display names
  const chartData = Object.entries(data)
    .map(([id, counts]) => {
      const total = counts.success + counts.failure;
      const successRate =
        total > 0 ? Math.round((counts.success / total) * 100) : 0;
      const failureRate = 100 - successRate;

      return {
        id,
        name: nameMapping[id] || id,
        success: counts.success,
        failure: counts.failure,
        successRate,
        failureRate,
        total,
      };
    })
    .sort((a, b) => b.total - a.total) // Sort by total actions
    .slice(0, 10); // Take top 10

  // Generate config for chart colors using CSS variables
  const chartConfig = {
    successful: {
      label: "Successful",
      theme: {
        light: "hsl(var(--chart-2))",
        dark: "hsl(var(--chart-2))",
      },
    },
    failed: {
      label: "Failed",
      theme: {
        light: "hsl(var(--destructive))",
        dark: "hsl(var(--destructive))",
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
            barGap={0}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              opacity={0.6}
            />
            <XAxis
              type="number"
              domain={[0, "dataMax"]}
              tickFormatter={(value) => value.toString()}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
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
                  const item = payload[0].payload;

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="mb-2 font-semibold">{item.name}</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-sm bg-[hsl(var(--chart-2))]" />
                            <span className="text-sm">Success</span>
                          </div>
                          <span className="font-medium tabular-nums">
                            {item.success} ({item.successRate}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded-sm bg-[hsl(var(--destructive))]" />
                            <span className="text-sm">Failure</span>
                          </div>
                          <span className="font-medium tabular-nums">
                            {item.failure} ({item.failureRate}%)
                          </span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total</span>
                            <span className="font-medium tabular-nums">
                              {item.total}
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
            <Bar
              dataKey="success"
              stackId="a"
              fill="var(--color-success)"
              name="Success"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="failure"
              stackId="a"
              fill="var(--color-failure)"
              name="Failure"
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="successRate"
                position="insideRight"
                formatter={(value: number) => `${value}%`}
                style={{
                  fill: "white",
                  fontSize: 11,
                  fontWeight: 500,
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
