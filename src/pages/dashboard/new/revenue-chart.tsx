import * as React from "react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type RevenueChartPoint = {
  date: string;
  value: number;
};

type RevenueChartProps = {
  data: RevenueChartPoint[];
  loading?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatAxisDate(value: string): string {
  return format(new Date(value), "MMM dd");
}

function RevenueTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{formatAxisDate(String(label))}</p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="font-medium text-foreground">
          {formatCurrency(Number(value))}
        </span>
      </p>
    </div>
  );
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        date: item.date,
        value: Number(item.value ?? 0),
      })),
    [data],
  );

  return (
    <Card className="rounded-2xl  col-span-8">
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>

      <CardContent className="h-[360px]">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No revenue data found for this date range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 12,
                right: 16,
                left: 8,
                bottom: 8,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="currentColor"
                    stopOpacity={0.24}
                  />
                  <stop
                    offset="95%"
                    stopColor="currentColor"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                className="text-xs text-muted-foreground"
              />

              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value))}
                tickLine={false}
                axisLine={false}
                width={80}
                className="text-xs text-muted-foreground"
              />

              <Tooltip content={<RevenueTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                fill="url(#revenueGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
