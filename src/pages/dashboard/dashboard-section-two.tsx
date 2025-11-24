/* eslint-disable react-hooks/exhaustive-deps */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TrendingUp } from "lucide-react";
import React from "react";
import { Label, Pie, PieChart } from "recharts";

const DashBoardSectionTwo = () => (
  <section className="grid grid-cols-1 gap-5 overflow-hidden transition-transform duration-300 ease-in-out md:grid-cols-4 lg:grid-cols-3">
    <Card className="md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Total Sells</CardTitle>
        <CardDescription>15% from last Month</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <NumberTicker
            className="font-bold font-geist text-4xl"
            delay={0.6}
            value={100}
          />
        </div>
      </CardContent>
    </Card>

    <Card className="md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Total Orders</CardTitle>
        <CardDescription>20.1% from last month</CardDescription>
      </CardHeader>
      <CardContent>
        <NumberTicker
          className="font-bold font-geist text-4xl"
          delay={0.6}
          value={100}
        />
      </CardContent>
    </Card>
    <TotalVisitors />
  </section>
);

export default DashBoardSectionTwo;

const TotalVisitors = () => {
  const chartData = [
    { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
    { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
    { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
    { browser: "other", visitors: 190, fill: "var(--color-other)" },
  ];
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "hsl(var(--chart-1))",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
    firefox: {
      label: "Firefox",
      color: "hsl(var(--chart-3))",
    },
    edge: {
      label: "Edge",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig;

  const totalVisitors = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.visitors, 0),
    []
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="md:col-span-4 md:row-start-2 lg:col-span-1 lg:row-start-auto">
          <CardHeader>
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>13% from last Month</CardDescription>
          </CardHeader>
          <CardContent>
            <NumberTicker
              className="font-bold font-geist text-4xl"
              delay={0.6}
              value={1125}
            />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pie Chart - Donut with Text</DialogTitle>
          <DialogDescription>January - June 2024</DialogDescription>
        </DialogHeader>

        <div className="flex-1 pb-0">
          <ChartContainer
            className="mx-auto aspect-square max-h-[250px]"
            config={chartConfig}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                innerRadius={60}
                nameKey="browser"
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          dominantBaseline="middle"
                          textAnchor="middle"
                          x={viewBox.cx}
                          y={viewBox.cy}
                        >
                          <tspan
                            className="fill-foreground font-bold text-3xl"
                            x={viewBox.cx}
                            y={viewBox.cy}
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            className="fill-muted-foreground"
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                          >
                            Visitors
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <DialogFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
