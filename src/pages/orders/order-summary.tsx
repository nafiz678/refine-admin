import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Calendar,
  Clock,
  CreditCard,
  User,
  Mail,
  MapPin,
  Receipt,
  Tag,
  FileText,
  CheckCircle,
  CircleDashed,
  ArrowLeft,
  Truck,
  Phone,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin, supabaseClient } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/lib/supabase";

export type OrderProduct =
  Database["public"]["Tables"]["orderProduct"]["Row"];
type Coupon =
  Database["content"]["Tables"]["coupons"]["Row"];

export function OrderSummary() {
  const { id } = useParams();
  // Fetch order with products and address
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) return null;
      // Fetch the order
      const { data: orderData, error: orderError } =
        await supabaseClient
          .from("order")
          .select("*")
          .eq("id", id || "")
          .single();

      if (orderError || !orderData) return null;

      // Fetch products
      const { data: productsData } = await supabaseClient
        .from("orderProduct")
        .select("*")
        .eq("orderId", id || "");

      // Fetch address
      const { data: addressData } = await supabaseClient
        .from("orderAddress")
        .select("*")
        .eq("orderId", id || "")
        .single();

      // Fetch user from Supabase Auth
      const { data: userData } =
        await supabaseAdmin.auth.admin.getUserById(
          orderData.profileId
        );

      // Fetch coupon from content schema if coupon code exists
      let couponData: Coupon | null = null;
      if (orderData.coupon) {
        const { data: cdata } = await supabaseClient
          .schema("content")
          .from("coupons")
          .select("*")
          .eq("code", orderData.coupon)
          .single();
        // if your coupons are under a different schema use .schema("content").from(...)
        if (cdata) couponData = cdata;
      }

      return {
        id: orderData.id,
        coupon: orderData.coupon,
        discountedPrice: orderData.discountedPrice,
        paymentTotal: orderData.paymentTotal,
        paymentMethod: orderData.paymentMethod,
        orderStatus: orderData.orderStatus,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        shippingCost: orderData.shippingCost,
        user: {
          name:
            userData?.user?.user_metadata?.name ||
            "Unknown",
          email: userData?.user?.email || "Unknown",
        },
        products: productsData ?? [],
        address: addressData ?? undefined,
        couponData,
        phone: orderData.paymentNumber,
        notes: orderData.notes
      };
    },
  });

  if (isLoading) return <OrderSummaryLoader />;
  if (!order) return <p>Order not found</p>;

  // ----- CALCULATIONS ----- //
  // 1) subtotal from items (use discountedPrice when available)
  const subtotal = order.products.reduce((acc, item) => {
    const unit =
      typeof item.price === "number"
        ? item.price
        : item.price;
    return acc + Number(unit) * Number(item.quantity);
  }, 0);
  // 2) shipping cost: prefer explicit order.shippingCost, else 0
  const shippingCost = Number(order.shippingCost ?? 0);

  // 3) coupon determination & calculation
  let couponApplied = false;
  let couponDiscount = 0;
  const now = new Date();

  if (order.couponData) {
    const c = order.couponData;
    const start = c.startDate
      ? new Date(c.startDate)
      : null;
    const end = c.endDate ? new Date(c.endDate) : null;

    const withinDates =
      (!start || now >= start) && (!end || now <= end);

    const meetsMin =
      typeof c.minCartValue === "number"
        ? subtotal >= c.minCartValue
        : true;

    if (withinDates && meetsMin) {
      // coupon valid: compute discount
      if (c.couponType === "FIXED_AMOUNT") {
        couponDiscount = Number(c.discountAmount ?? 0);
      } else if (c.couponType === "PERCENTAGE") {
        const pct = Number(c.discountPercentage ?? 0);
        couponDiscount = Math.floor((subtotal * pct) / 100);
      }

      // Ensure discount doesn't exceed subtotal
      if (couponDiscount > subtotal)
        couponDiscount = subtotal;

      if (couponDiscount > 0) couponApplied = true;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      couponApplied = false;
      couponDiscount = 0;
    }
  }

  // 4) totals
  const totalBeforeShipping = Math.max(
    subtotal - couponDiscount,
    0
  );
  const finalTotal = totalBeforeShipping + shippingCost;

  // For display: also keep discount as positive number for "You Saved"
  const youSaved = couponDiscount;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Order Summary
          </h1>
          <p className="text-sm text-muted-foreground">
            Order ID:{" "}
            <span className="font-mono text-xs">
              {order.id}
            </span>
          </p>
        </div>
        <Badge
          variant={"outline"}
          className={`w-fit text-sm font-medium ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {order.orderStatus}
        </Badge>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />{" "}
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-8">
                {order.products.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col md:flex-row gap-8 p-6 rounded-2xl border bg-card transition-all hover:shadow-xl hover:shadow-black/3 dark:hover:shadow-white/2"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 w-full md:w-56 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <img
                        src={`${supabaseUrl}/storage/v1/object/public/${item.image}`}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          const target =
                            e.currentTarget as HTMLImageElement;
                          target.src =
                            "/premium-product-shot.jpg";
                        }}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col py-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex flex-col sm:items-end">
                          <span className="text-2xl font-light tracking-tight text-foreground">
                            ৳{item.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            Per Unit
                          </span>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-border/50">
                        {item.size && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                              Size
                            </span>
                            <p className="text-sm font-medium text-foreground">
                              {item.size}
                            </p>
                          </div>
                        )}
                        {item.color && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                              Color
                            </span>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {item.color}
                            </p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Quantity
                          </span>
                          <p className="text-sm font-medium text-foreground">
                            ×{item.quantity}
                          </p>
                        </div>
                        <div className="space-y-1 sm:text-end">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Subtotal
                          </span>
                          <p className="text-sm font-bold text-foreground">
                            ৳
                            {(
                              item.price * item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Coupon Applied
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.coupon || "None"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Payment Total
                    </p>
                    <p className="font-semibold text-foreground">
                      ৳{order.paymentTotal}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      You Saved
                    </p>
                    <p className="font-semibold text-emerald-600">
                      ৳{youSaved}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/Status Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />{" "}
                Timeline & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-24px)] before:w-0.5 before:bg-border">
                {/* Created */}
                <div className="relative">
                  <div className="absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Order Created
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Updated */}
                <div className="relative">
                  <div className="absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Last Updated
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="relative">
                  <div className="absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CircleDashed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Current Status
                      </span>
                    </div>
                    <Badge
                      className={`mt-2 ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notes Card */}
          <Card>
            <CardHeader className="">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />{" "}
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                <p className="text-sm italic text-muted-foreground">
                  {order.notes}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />{" "}
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Name
                  </p>
                  <p className="font-medium text-foreground">
                    {order.user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Email
                  </p>
                  <p className="font-medium text-foreground">
                    {order.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Phone
                  </p>
                  <p className="font-medium text-foreground">
                    {order.phone}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Shipping Address
                  </p>
                  {order.address ? (
                    <p className="text-sm text-foreground">
                      {order.address.address},{" "}
                      {order.address.zip}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No shipping address provided
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Info Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />{" "}
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Method
                </span>
                <span className="font-medium text-foreground">
                  {order.paymentMethod}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-foreground">
                  ৳{subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  Coupon ({order.coupon || "None"})
                </span>
                <span className="text-emerald-600">
                  -৳{youSaved}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  Shipping Cost
                </span>
                <span className="text-emerald-600">
                  +৳{order.shippingCost}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-foreground">
                  ৳{finalTotal}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      // Soft warning tint
      return "bg-[#E6F0F2] text-[#7296A4] border-[#CDDEE5]";

    case "PROCESSING":
      // Base tone for active state
      return "bg-[#CDDEE5] text-[#4F7482] border-[#9EBECB]";

    case "SHIPPED":
      // Slightly darker = movement/transition
      return "bg-[#9EBECB] text-[#3B5A65] border-[#7296A4]";

    case "DELIVERED":
      // Success but within same palette
      return "bg-[#7296A4] text-white border-[#5E7F8C]";

    case "CANCELLED":
      // Neutral-gray from your palette
      return "bg-[#EFEFEF] text-[#6B6B6B] border-[#CDDEE5]";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function OrderSummaryLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />{" "}
          {/* Title */}
          <Skeleton className="h-4 w-32 rounded-md" />{" "}
          {/* Order ID */}
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />{" "}
        {/* Status Badge */}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Details Card */}
          <Skeleton className="h-64 w-full rounded-xl" />

          {/* Timeline/Status Card */}
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notes Card */}
          <Skeleton className="h-32 w-full rounded-xl" />

          {/* Customer Info Card */}
          <Skeleton className="h-48 w-full rounded-xl" />

          {/* Billing Info Card */}
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>

      {/* Optional: Animate individual product rows in order details */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex gap-4">
            <Skeleton className="h-32 w-32 rounded-lg" />{" "}
            {/* Product Image */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2 rounded-md" />{" "}
              {/* Product Title */}
              <Skeleton className="h-4 w-1/3 rounded-md" />{" "}
              {/* Product Price */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
