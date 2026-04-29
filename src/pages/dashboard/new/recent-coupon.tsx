import * as React from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RecentCouponRow = {
  id: string;
  code: string;
  couponType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountAmount: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
};

type RecentCouponProps = {
  rows: RecentCouponRow[];
  loading?: boolean;
};

const statusVariantMap: Record<
  RecentCouponRow["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  EXPIRED: "destructive",
};

const couponTypeLabelMap: Record<RecentCouponRow["couponType"], string> = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed Amount",
};

function formatDiscount(coupon: RecentCouponRow): string {
  if (coupon.couponType === "PERCENTAGE") {
    return `${coupon.discountPercentage}%`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(coupon.discountAmount);
}

function formatDate(value: string): string {
  return format(new Date(value), "dd MMM yyyy");
}

export default function RecentCoupon({ rows, loading }: RecentCouponProps) {
  return (
    <Card className="rounded-2xl lg:col-span-4 col-span-8">
      <CardHeader>
        <CardTitle>Active Coupons</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No coupons found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Ends</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium uppercase">
                    {coupon.code}
                  </TableCell>

                  <TableCell>{couponTypeLabelMap[coupon.couponType]}</TableCell>

                  <TableCell>{formatDiscount(coupon)}</TableCell>

                  <TableCell>
                    <Badge variant={statusVariantMap[coupon.status]}>
                      {coupon.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{formatDate(coupon.startDate)}</TableCell>

                  <TableCell>{formatDate(coupon.endDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
