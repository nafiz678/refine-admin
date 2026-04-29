// components/dashboard/charts/order-status-chart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  pending: "#f59e0b", // amber
  completed: "#10b981", // green
  cancelled: "#ef4444", // red
};

export function OrderStatusChart({
  pending,
  completed,
  cancelled,
  loading,
}: {
  pending: number;
  completed: number;
  cancelled: number;
  loading?: boolean;
}) {
  const data = [
    { name: "Pending", value: pending, color: COLORS.pending },
    { name: "Completed", value: completed, color: COLORS.completed },
    { name: "Cancelled", value: cancelled, color: COLORS.cancelled },
  ];

  const total = pending + completed + cancelled;

  return (
    <Card className="rounded-2xl col-span-4">
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>

      <CardContent className="h-50 flex items-center justify-center">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : total === 0 ? (
          <div className="text-sm text-muted-foreground">
            No order data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>

      {/* Legend */}
      {!loading && total > 0 && (
        <div className="px-6 pb-4 space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
