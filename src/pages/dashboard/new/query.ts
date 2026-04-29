import { supabaseAdmin, supabaseClient } from "@/lib";
import { queryOptions } from "@tanstack/react-query";

export type DashboardRangeProp = {
  from: string;
  to: string;
};

export type RecentOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

export type ActiveCoupons = {
  id: string;
  code: string;
  couponType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountAmount: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
};

export type RevenueSeriesPoint = {
  date: string;
  value: number;
};

export type DashboardOverview = {
  revenue: {
    total: number;
    changePercentage: number;
    series: RevenueSeriesPoint[];
  };
  orders: {
    total: number;
    changePercentage: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  users: {
    total: number;
    changePercentage: number;
  };
  activeCoupons: ActiveCoupons[];
  products: {
    total: number;
    lowStock: number;
  };
  categories: {
    total: number;
  };
  banners: {
    total: number;
    active: number;
    inactive: number;
  };
  collections: {
    total: number;
    empty: number;
  };
  recentOrders: RecentOrder[];
};

type QueryResultWithError = {
  error: { message: string } | null;
};

type OrderRow = {
  id: string;
  paymentTotal: number;
  orderStatus:
  | "PENDING"
  | "PROCESSING"
  | "PACKAGING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
  createdAt: string;
  profileId: string;
};

const LOW_STOCK_THRESHOLD = 5;

function assertNoErrors(responses: QueryResultWithError[]): void {
  const error = responses.find((response) => response.error)?.error;

  if (error) {
    throw new Error(error.message);
  }
}

function getCouponStatus(
  coupon: Pick<ActiveCoupons, "startDate" | "endDate">,
  now: string,
): ActiveCoupons["status"] {
  if (coupon.endDate < now) return "EXPIRED";
  if (coupon.startDate > now) return "INACTIVE";

  return "ACTIVE";
}

function buildRevenueSeries(orders: OrderRow[]): RevenueSeriesPoint[] {
  const revenueByDate = new Map<string, number>();

  for (const order of orders) {
    const date = order.createdAt.slice(0, 10);
    const currentValue = revenueByDate.get(date) ?? 0;

    revenueByDate.set(date, currentValue + Number(order.paymentTotal ?? 0));
  }

  return Array.from(revenueByDate.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function dashboardOverviewQueryOptions(range: DashboardRangeProp) {
  return queryOptions({
    queryKey: ["dashboard-overview", range.from, range.to],
    queryFn: () => getDashboardOverview(range),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export async function getDashboardOverview(
  range: DashboardRangeProp,
): Promise<DashboardOverview> {
  const { from, to } = range;
  const now = new Date().toISOString();

  const [
    ordersRes,
    usersRes,
    activeCouponsRes,
    productCountRes,
    lowStockVariantsRes,
    categoriesRes,
    bannersRes,
    collectionsRes,
  ] = await Promise.all([
    supabaseClient
      .from("order")
      .select("id, paymentTotal, orderStatus, createdAt, profileId")
      .gte("createdAt", from)
      .lte("createdAt", to)
      .order("createdAt", { ascending: false }),

    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    supabaseClient
      .schema("content")
      .from("coupons")
      .select(
        "id, code, couponType, discountAmount, discountPercentage, startDate, endDate",
      )
      .order("createdAt", { ascending: false })
      .limit(5),

    supabaseClient
      .from("product")
      .select("id", { count: "exact", head: true }),

    supabaseClient
      .from("productVariant")
      .select("id", { count: "exact", head: true })
      .lt("stockQty", LOW_STOCK_THRESHOLD),

    supabaseClient
      .from("category")
      .select("id", { count: "exact", head: true }),

    supabaseClient
      .schema("content")
      .from("banner")
      .select("id", { count: "exact", head: true }),

    supabaseClient
      .schema("content")
      .from("collection")
      .select("id", { count: "exact", head: true }),
  ]);

  assertNoErrors([
    ordersRes,
    usersRes,
    activeCouponsRes,
    productCountRes,
    lowStockVariantsRes,
    categoriesRes,
    bannersRes,
    collectionsRes,
  ]);

  const orders = (ordersRes.data ?? []) as OrderRow[];
  const coupons = activeCouponsRes.data ?? [];
  const users = usersRes.data.users ?? [];

  const userById = new Map(users.map((user) => [user.id, user]));

  const revenueTotal = orders.reduce(
    (sum, order) => sum + Number(order.paymentTotal ?? 0),
    0,
  );

  return {
    revenue: {
      total: revenueTotal,
      changePercentage: 0,
      series: buildRevenueSeries(orders),
    },
    orders: {
      total: orders.length,
      changePercentage: 0,
      pending: orders.filter((order) => order.orderStatus === "PENDING").length,
      completed: orders.filter((order) => order.orderStatus === "DELIVERED")
        .length,
      cancelled: orders.filter((order) => order.orderStatus === "CANCELLED")
        .length,
    },
    users: {
      total: users.length,
      changePercentage: 0,
    },
    activeCoupons: coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      couponType: coupon.couponType,
      discountAmount: Number(coupon.discountAmount ?? 0),
      discountPercentage: Number(coupon.discountPercentage ?? 0),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      status: getCouponStatus(coupon, now),
    })),
    products: {
      total: productCountRes.count ?? 0,
      lowStock: lowStockVariantsRes.count ?? 0,
    },
    categories: {
      total: categoriesRes.count ?? 0,
    },
    banners: {
      total: bannersRes.count ?? 0,
      active: bannersRes.count ?? 0,
      inactive: 0,
    },
    collections: {
      total: collectionsRes.count ?? 0,
      empty: 0,
    },
    recentOrders: orders.slice(0, 10).map((order) => {
      const user = userById.get(order.profileId);

      return {
        id: order.id,
        customerName:
          user?.user_metadata?.full_name ??
          user?.user_metadata?.name ??
          user?.email ??
          "Unknown Customer",
        total: Number(order.paymentTotal ?? 0),
        status: order.orderStatus,
        createdAt: order.createdAt,
      };
    }),
  };
}
