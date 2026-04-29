import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  DollarSign,
  ImageIcon,
  Layers3,
  LayoutGrid,
  Package,
  RefreshCcw,
  ShoppingCart,
  TicketPercent,
  // TicketPercent,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/refine-ui/layout/page-header";

import { DashboardDateRangeFilter } from "./data-filter";
import {
  dashboardOverviewQueryOptions,
  type DashboardRangeProp,
} from "./query";
import { RecentOrdersTable } from "./recent-orders";
import RecentCoupon from "./recent-coupon";
import { OrderStatusChart } from "./order-status-chart";
import { RevenueChart } from "./revenue-chart";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function getDefaultRange(): DashboardRangeProp {
  const today = new Date();

  return {
    from: format(subDays(today, 29), "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
  };
}

export function DashboardShell() {
  const [range, setRange] = React.useState<DashboardRangeProp>(() =>
    getDefaultRange(),
  );

  const {
    data: overview,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery(dashboardOverviewQueryOptions(range));

  const handleRefresh = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Dashboard"
          subtitle="Real-time business overview across sales, users, products, and operations."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString()
              : "Not refreshed yet"}
          </p>
          <DashboardDateRangeFilter value={range} onChange={setRange} />
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCcw
              className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </section>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load dashboard</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading dashboard data."}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading || !overview ? (
        <KpiGridSkeleton />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Revenue"
            value={formatCurrency(overview.revenue.total)}
            delta={overview.revenue.changePercentage}
            hint="Total sales revenue for selected date range"
            icon={<DollarSign className="size-4" />}
          />

          <KpiCard
            title="Orders"
            value={formatCompact(overview.orders.total)}
            delta={overview.orders.changePercentage}
            hint={`${overview.orders.pending} pending / ${overview.orders.completed} completed / ${overview.orders.cancelled} cancelled`}
            icon={<ShoppingCart className="size-4" />}
          />

          <KpiCard
            title="Users"
            value={formatCompact(overview.users.total)}
            delta={overview.users.changePercentage}
            icon={<Users className="size-4" />}
            hint="Total registered auth users"
          />

          <KpiCard
            title="Coupons"
            value={formatCompact(overview.activeCoupons.length)}
            hint={`${formatCompact(overview.activeCoupons.length)} latest coupons shown below`}
            icon={<TicketPercent className="size-4" />}
          />

          <KpiCard
            title="Products"
            value={formatCompact(overview.products.total)}
            hint={`${overview.products.lowStock} low-stock variants need attention`}
            icon={<Package className="size-4" />}
          />

          <KpiCard
            title="Categories"
            value={formatCompact(overview.categories.total)}
            hint="Total product categories available"
            icon={<Layers3 className="size-4" />}
          />

          <KpiCard
            title="Banners"
            value={formatCompact(overview.banners.total)}
            hint="Total marketing banners configured"
            icon={<ImageIcon className="size-4" />}
          />

          <KpiCard
            title="Collections"
            value={formatCompact(overview.collections.total)}
            hint="Total curated product collections"
            icon={<LayoutGrid className="size-4" />}
          />
        </section>
      )}

      <section className="grid lg:grid-cols-12 grid-cols-1 gap-8 w-full">
        <RecentOrdersTable
          rows={overview?.recentOrders ?? []}
          loading={isLoading}
        />
        <RecentCoupon
          rows={overview?.activeCoupons ?? []}
          loading={isLoading}
        />
      </section>
      <section className="grid lg:grid-cols-12 grid-cols-1 gap-6">
        <RevenueChart
          data={overview?.revenue.series ?? []}
          loading={isLoading}
        />
        <OrderStatusChart
          cancelled={overview?.orders.cancelled || 0}
          completed={overview?.orders.completed || 0}
          pending={overview?.orders.pending || 0}
        />
      </section>
    </main>
  );
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatCompact(value: number): string {
  return numberFormatter.format(value);
}

type KpiCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  delta?: number;
  hint?: string;
};

function KpiCard({ title, value, icon, hint }: KpiCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-linear-to-br from-background to-muted/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="rounded-xl border bg-background/80 p-2 shadow-sm">
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>

        {hint ? (
          <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function KpiGridSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} className="rounded-2xl">
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>

          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
