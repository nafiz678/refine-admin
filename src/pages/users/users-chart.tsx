import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo, useState } from "react";

type ChartRow = {
  date: string;
  registered: number;
  active: number;
};

const chartConfig = {
  registered: {
    label: "Registered Users",
    color: "var(--chart-1)",
  },
  active: {
    label: "Active Users",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatDateKey(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function buildUsersChartData(users: User[]): ChartRow[] {
  const map = new Map<string, ChartRow>();

  for (const user of users) {
    if (user.created_at) {
      const createdKey = formatDateKey(user.created_at);

      if (!map.has(createdKey)) {
        map.set(createdKey, {
          date: createdKey,
          registered: 0,
          active: 0,
        });
      }

      map.get(createdKey)!.registered += 1;
    }

    if (user.last_sign_in_at) {
      const activeKey = formatDateKey(user.last_sign_in_at);

      if (!map.has(activeKey)) {
        map.set(activeKey, {
          date: activeKey,
          registered: 0,
          active: 0,
        });
      }

      map.get(activeKey)!.active += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function UsersChart({ users }: { users: User[] }) {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("registered");

  const chartData = useMemo(() => buildUsersChartData(users), [users]);

  const totals = useMemo(
    () => ({
      registered: chartData.reduce((sum, item) => sum + item.registered, 0),
      active: chartData.reduce((sum, item) => sum + item.active, 0),
    }),
    [chartData],
  );

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0">
          <CardTitle>Users Chart</CardTitle>
          <CardDescription>
            Registered and active users from your database
          </CardDescription>
        </div>

        <div className="flex">
          {(["registered", "active"] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-muted-foreground text-xs">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {totals[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-40"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
