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
} from "lucide-react";
import { useParams } from "react-router";
import { MOCK_ORDERS } from "./orders";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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

export function OrderSummary() {
  const { id } = useParams();
  const order = MOCK_ORDERS.find(
    (order) => order.id === id
  );

  if (!order) return null;

  const discount =
    order.product.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) - order.discountedPrice;

  const subtotal = order.product.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
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
        {/* Left Column - Wider */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Details Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Info */}
              {order.product.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={
                        item.thumbnail || "/placeholder.svg"
                      }
                      alt={item.title}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title} (x{item.quantity})
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Original Price:
                        </span>
                        <span className="text-sm line-through text-muted-foreground">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Discounted Price:
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatCurrency(
                            item.price * item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

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
                      {order.coupon}
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
                      {formatCurrency(order.paymentTotal)}
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
                      {formatCurrency(discount)}
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
                <Clock className="h-5 w-5 text-primary" />
                Timeline & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-24px)] before:w-0.5 before:bg-border">
                {/* Order Created */}
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

                {/* Last Updated */}
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
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                <p className="text-sm italic text-muted-foreground">
                  No special instructions or notes provided
                  for this order.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
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
              <Separator />
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Shipping Address
                  </p>
                  <p className="text-sm italic text-muted-foreground">
                    No shipping address provided
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Info Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
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
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  Coupon ({order.coupon})
                </span>
                <span className="text-emerald-600">
                  -{formatCurrency(discount)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(order.discountedPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
