import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import OrdersTable from "./order-table";
import { PageHeader } from "@/components/refine-ui/layout/page-header";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin, supabaseClient } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKAGING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | OrderStatus
  >("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch orders
  const { data: ordersData, isLoading: orderLoading } =
    useQuery({
      queryKey: [
        "orders",
        searchTerm,
        selectedStatus,
        sortBy,
      ],
      queryFn: async () => {
        let query = supabaseClient
          .from("order")
          .select("*")
          .order("createdAt", {
            ascending: sortBy === "oldest",
          });

        if (selectedStatus !== "all")
          query = query.eq("orderStatus", selectedStatus);

        if (searchTerm.trim()) {
          const term = `%${searchTerm.toLowerCase()}%`;
          query = query.or(`id.ilike.${term}`);
        }

        if (sortBy === "amount_high")
          query = query.order("paymentTotal", {
            ascending: false,
          });
        if (sortBy === "amount_low")
          query = query.order("paymentTotal", {
            ascending: true,
          });

        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
    });

  const {
    data: enrichedOrders,
    isLoading: isEnrichedLoading,
  } = useQuery({
    queryKey: ["enrichedOrders", ordersData],
    enabled: !!ordersData?.length,
    queryFn: async () => {
      if (!ordersData) return [];

      // Cache for users to prevent multiple calls
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userCache = new Map<string, any>();

      async function getUserByIdCached(profileId: string) {
        if (userCache.has(profileId))
          return userCache.get(profileId);

        const { data, error } =
          await supabaseAdmin.auth.admin.getUserById(
            profileId
          );
        if (!data || error) return null;

        userCache.set(profileId, data.user);
        return data.user;
      }

      return Promise.all(
        ordersData.map(async (order) => {
          const user = await getUserByIdCached(
            order.profileId
          );

          // Fetch products for this order
          const { data: productsData } =
            await supabaseClient
              .from("orderProduct")
              .select("*")
              .eq("orderId", order.id);

          return {
            ...order,
            userEmail: user?.email || "Unknown",
            userName:
              user?.user_metadata?.name || "Unknown",
            products: productsData || [],
          };
        })
      );
    },
  });

  const isLoading = orderLoading || isEnrichedLoading;

  if (isLoading) return <OrdersPageLoader />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Orders"
          subtitle="Manage and track all your customer orders in one place"
        />

        {/* Filters & Controls */}
        <Card className="border-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-12">
            {/* Search */}
            <div className="sm:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by..."
                  className="border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(
                    value as "all" | OrderStatus
                  )
                }
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="All Statuses">
                    {
                      STATUS_OPTIONS.find(
                        (s) => s.value === selectedStatus
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectGroup>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectGroup>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="sm:col-span-2">
              <Button
                onClick={() => window.print()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm ||
            selectedStatus !== "all" ||
            sortBy !== "newest") && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Active filters:
              </span>
              {searchTerm && (
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedStatus !== "all" && (
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {
                    STATUS_OPTIONS.find(
                      (s) => s.value === selectedStatus
                    )?.label
                  }
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Orders Table */}
        <OrdersTable
          orders={enrichedOrders || []}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />

        {/* No Results */}
        {!isLoading && enrichedOrders?.length === 0 && (
          <Card className="border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No orders found. Try adjusting your filters or
              search criteria.
            </p>
          </Card>
        )}

        {/* Results Count */}
        <div className="text-right text-sm text-muted-foreground">
          Showing {enrichedOrders?.length} orders
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Highest Amount" },
  { value: "amount_low", label: "Lowest Amount" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

function OrdersPageLoader() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 rounded-md" />{" "}
          {/* Title */}
          <Skeleton className="h-4 w-2/3 rounded-md" />{" "}
          {/* Subtitle */}
        </div>

        {/* Filters & Controls Skeleton */}
        <div className="border-border bg-card p-4 sm:p-6 space-y-4 rounded-xl">
          <div className="grid gap-4 sm:grid-cols-12">
            {/* Search */}
            <Skeleton className="h-10 sm:col-span-5 rounded-md" />
            {/* Status Filter */}
            <Skeleton className="h-10 sm:col-span-3 rounded-md" />
            {/* Sort */}
            <Skeleton className="h-10 sm:col-span-2 rounded-md" />
            {/* Export Button */}
            <Skeleton className="h-10 sm:col-span-2 rounded-md" />
          </div>
        </div>

        {/* Orders Table Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-4 border-b border-border p-4 sm:p-6 rounded-xl bg-card"
            >
              <Skeleton className="col-span-2 h-4 rounded-md" />{" "}
              {/* Order ID */}
              <Skeleton className="col-span-3 h-4 rounded-md" />{" "}
              {/* Customer */}
              <Skeleton className="col-span-3 h-4 rounded-md" />{" "}
              {/* Email */}
              <Skeleton className="col-span-2 h-4 rounded-md" />{" "}
              {/* Status */}
              <Skeleton className="col-span-2 h-4 rounded-md" />{" "}
              {/* Amount */}
            </div>
          ))}
        </div>

        {/* No Results / Footer Skeleton */}
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
