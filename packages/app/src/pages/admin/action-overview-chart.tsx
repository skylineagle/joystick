import { ChartContainer } from "@/components/ui/chart";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

interface ActionOverviewChartProps {
  data: Record<string, number>;
  // Optional mapping of IDs to display names
  nameMapping?: Record<string, string>;
  // Flag to indicate if the data represents percentages (for success rates)
  isPercentage?: boolean;
}

export function ActionOverviewChart({
  data,
  nameMapping = {},
  isPercentage = false,
}: ActionOverviewChartProps) {
  // Convert data to pie chart format with display names
  const chartData = Object.entries(data).map(([id, value]) => ({
    id,
    name: nameMapping[id] || id, // Use mapping if available, otherwise use ID
    value,
  }));

  // Generate config for chart colors using CSS variables
  const chartConfig = Object.fromEntries(
    Object.keys(data).map((key, index) => {
      // Use modulo to cycle through the color variables
      const colorIndex = (index % 15) + 1;

      return [
        key,
        {
          label: nameMapping[key] || key,
          // Use hsl with the CSS variable
          theme: {
            light: `hsl(var(--chart-${colorIndex}))`,
            dark: `hsl(var(--chart-${colorIndex}))`,
          },
        },
      ];
    })
  );

  return (
    <div className="w-full h-full flex justify-center items-center">
      {Object.keys(data).length === 0 ? (
        <p className="text-muted-foreground text-center">No data available</p>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[250px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              labelLine={false}
            >
              {chartData.map(({ id }) => (
                <Cell
                  key={`cell-${id}`}
                  fill={`var(--color-${id})`}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const total = chartData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  );
                  const percent = ((data.value / total) * 100).toFixed(1);

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isPercentage ? (
                          <>
                            Success Rate:{" "}
                            <span className="font-medium text-foreground">
                              {data.value}%
                            </span>
                          </>
                        ) : (
                          <>
                            Count:{" "}
                            <span className="font-medium text-foreground">
                              {data.value}
                            </span>
                          </>
                        )}
                      </p>
                      {!isPercentage && (
                        <p className="text-sm text-muted-foreground">
                          Share:{" "}
                          <span className="font-medium text-foreground">
                            {percent}%
                          </span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 11, paddingLeft: 20 }}
              formatter={(value) => {
                // Show the percentage in the legend for success rate chart
                if (isPercentage) {
                  const item = chartData.find((d) => d.name === value);
                  return (
                    <span className="text-xs">
                      {value}: {item ? item.value : 0}%
                    </span>
                  );
                }
                return <span className="text-xs">{value}</span>;
              }}
            />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}
