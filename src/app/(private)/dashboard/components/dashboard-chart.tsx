"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const config = { value: { label: "Quantidade", color: "var(--chart-1)" } };
const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function DashboardChart({
  data,
  trend,
}: {
  data: { label: string; value: number }[];
  trend?: boolean;
}) {
  const tooltip = <ChartTooltip content={<ChartTooltipContent />} />;
  return (
    <ChartContainer
      config={config}
      className="motion-safe:animate-in motion-safe:fade-in aspect-auto w-full motion-safe:duration-500"
      style={{ height: trend ? 220 : Math.max(140, data.length * 32 + 30) }}
    >
      {trend ? (
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ left: 4, right: 12, top: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            allowDecimals={false}
            width={30}
            tickLine={false}
            axisLine={false}
          />
          {tooltip}
          <Line
            dataKey="value"
            type="linear"
            stroke="var(--color-value)"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      ) : (
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ right: 8 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={115}
            interval={0}
            tickLine={false}
            axisLine={false}
            tickFormatter={(label: string) =>
              label.length > 17 ? label.slice(0, 16) + "…" : label
            }
          />
          {tooltip}
          <Bar
            dataKey="value"
            radius={[0, 5, 5, 0]}
            maxBarSize={18}
            isAnimationActive={false}
          >
            {data.map(({ label }, index) => (
              <Cell key={label} fill={palette[index % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      )}
    </ChartContainer>
  );
}
