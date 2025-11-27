import React, { useMemo } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { Database } from "@/lib/supabase";
import { useDelete, useUpdate } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, formatDistance, isPast } from "date-fns";
import {
  Trash2,
  Pencil,
  Plus,
  Search,
  TrendingUp,
  Clock,
  Tag,
} from "lucide-react";
import { ListView } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export type CouponProp =
  Database["content"]["Tables"]["coupons"]["Row"];

export default function Coupon() {

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<CouponProp>();

    return [
      columnHelper.accessor("code", {
        header: "Code",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-2">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {getValue()}
            </span>
          </div>
        ),
      }),

      columnHelper.accessor("couponType", {
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue();
          return (
            <Badge
              className={
                type === "PERCENTAGE"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }
            >
              {type === "PERCENTAGE"
                ? "Percentage"
                : "Fixed Amount"}
            </Badge>
          );
        },
      }),

      columnHelper.display({
        header: "Discount",
        cell: ({ row }) =>
          row.original.couponType === "PERCENTAGE" ? (
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.discountPercentage}%
            </span>
          ) : (
            <span className="font-semibold text-gray-900 dark:text-white">
              ৳{row.original.discountAmount}
            </span>
          ),
          size: 110
      }),

      columnHelper.accessor("minCartValue", {
        header: "Min Cart Value",
        cell: ({ getValue }) => (
          <span className="text-gray-600 dark:text-gray-400">
            ৳{getValue()}
          </span>
        ),
        size: 130
      }),

      columnHelper.display({
        header: "Status",
        cell: ({ row }) => {
          const start = toDate(row.original.startDate);
          const end = toDate(row.original.endDate);
          const now = new Date();

          let status = "upcoming";
          let bgColor =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

          if (start && end) {
            if (start > now) {
              status = "upcoming";
              bgColor =
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            } else if (end < now) {
              status = "expired";
              bgColor =
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            } else {
              status = "active";
              bgColor =
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            }
          }

          return (
            <Badge className={bgColor}>
              {status.charAt(0).toUpperCase() +
                status.slice(1)}
            </Badge>
          );
        },
        size: 100
      }),

      columnHelper.accessor("startDate", {
        header: "Start Date",
        cell: ({ getValue }) => {
          const d = toDate(getValue());
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {d ? format(d, "MMM dd, yyyy") : "-"}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("endDate", {
        header: "End Date",
        cell: ({ getValue }) => {
          const d = toDate(getValue());
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {d
                ? isPast(d)
                  ? "Expired"
                  : `${formatDistance(d, new Date(), {
                      addSuffix: true,
                    })}`
                : "-"}
            </span>
          );
        },
        size: 120
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const onRefetch =
            table.refineCore.tableQuery.refetch;
          return (
            <ActionsCell row={row} onRefetch={onRefetch} />
          );
        },
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const table = useTable<CouponProp>({
    columns,
    refineCoreProps: {
      syncWithLocation: true,
      resource: "coupons",
      meta: {
        schema: "content",
      },
      filters: {
        mode: "server"
      }
    },
  });

  if (table.refineCore.tableQuery.isLoading) {
    return <Loader />;
  }

  return (
    <section className="container mx-auto space-y-6 p-4 md:p-8">
      <CouponHeader />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search by coupon code..."
            onChange={(e) => {
              const value = e.target.value;

              table.refineCore.setFilters([
                {
                  field: "code",
                  value: value,
                  operator: "contains",
                },
              ]);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <CouponStats
        coupons={
          table.refineCore.tableQuery.data?.data || []
        }
      />

      <ListView>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <DataTable table={table} />
        </div>
      </ListView>
    </section>
  );
}

function ActionsCell({
  row,
  onRefetch,
}: {
  row: { original: CouponProp };
  onRefetch?: () => void;
}) {
  const { mutate: deleteCoupon } = useDelete();
  const { mutate: updateCoupon } = useUpdate();

  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<
    DateRange | undefined
  >(() => ({
    from: toDate(row.original.startDate),
    to: toDate(row.original.endDate),
  }));

  const handleSave = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a valid date range.");
      return;
    }

    const now = new Date();

    const start = new Date(
      dateRange.from.getFullYear(),
      dateRange.from.getMonth(),
      dateRange.from.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const end = new Date(
      dateRange.to.getFullYear(),
      dateRange.to.getMonth(),
      dateRange.to.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const payload = {
      startDate: formatLocalDateTime(start),
      endDate: formatLocalDateTime(end),
    };

    updateCoupon(
      {
        resource: "coupons",
        id: row.original.id,
        values: payload,
        meta: {
          schema: "content",
        },
      },
      {
        onSuccess: () => {
          toast.success("Coupon updated successfully");
          setOpen(false);
          onRefetch?.();
        },
        onError: (error) => {
          console.error("Update coupon failed", error);
          toast.error("Failed to update coupon");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteCoupon(
      {
        resource: "coupons",
        meta: {
          schema: "content",
        },
        id: row.original.id,
      },
      {
        onSuccess: () => {
          toast.success("Coupon deleted successfully");
          onRefetch?.();
        },
        onError: (error) => {
          console.error("Delete coupon failed", error);
          toast.error("Failed to delete coupon");
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            aria-label={`Edit coupon ${row.original.code}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            title="Edit date range"
            type="button"
          >
            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Update Coupon Duration
            </DialogTitle>
          </DialogHeader>

          <div className="my-4">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onSelect={setDateRange}
              disabled={{ before: new Date() }}
              className="rounded-lg border shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Current:{" "}
                {row.original.startDate &&
                row.original.endDate
                  ? `${format(
                      new Date(row.original.startDate),
                      "MMM dd, yyyy"
                    )} — ${format(
                      new Date(row.original.endDate),
                      "MMM dd, yyyy"
                    )}`
                  : "Not set"}
              </div>
              <div className="text-xs mt-1">
                Pick a new range and save to update.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              aria-label="Cancel editing coupon dates"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              aria-label="Save coupon dates"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            aria-label={`Delete coupon ${row.original.code}`}
            title="Delete coupon"
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Coupon
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.original.code}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function toDate(
  value: string | Date | null | undefined
): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const formatLocalDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
};

function Loader() {
  const rows = Array.from({ length: 8 });

  return (
    <section className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full md:w-96 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="p-4 text-left">
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {rows.map((_, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="p-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </td>
                  <td className="p-4">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CouponStats({ coupons }: { coupons: CouponProp[] }) {
  const now = new Date();

  const active = coupons.filter((c) => {
    const start = toDate(c.startDate);
    const end = toDate(c.endDate);
    return start && end && start <= now && end >= now;
  }).length;

  const totalDiscount = coupons.reduce((acc, c) => {
    return (
      acc +
      (c.couponType === "PERCENTAGE"
        ? c.discountPercentage
        : c.discountAmount)
    );
  }, 0);

  const cardStyle = {
    background: `linear-gradient(
      to bottom right,
      var(--muted),
      var(--card)
    )`,
  };

  const iconClass = "w-12 h-12 opacity-40 text-primary";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Active Coupons */}
      <div
        className="rounded-xl p-6 border"
        style={cardStyle}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Coupons
            </p>
            <p className="text-3xl font-bold mt-2">
              {active}
            </p>
          </div>
          <Tag className={iconClass} />
        </div>
      </div>

      {/* Total Coupons */}
      <div
        className="rounded-xl p-6 border"
        style={cardStyle}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Coupons
            </p>
            <p className="text-3xl font-bold mt-2">
              {coupons.length}
            </p>
          </div>
          <TrendingUp className={iconClass} />
        </div>
      </div>

      {/* Total Discount */}
      <div
        className="rounded-xl p-6 border"
        style={cardStyle}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Discount Value
            </p>
            <p className="text-3xl font-bold mt-2">
              {totalDiscount}
            </p>
          </div>
          <Clock className={iconClass} />
        </div>
      </div>
    </div>
  );
}


function CouponHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Coupon Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Create and manage your promotional coupons
          </p>
        </div>
        <Link
          className={`${buttonVariants({
            variant: "default",
          })} flex items-center gap-2`}
          to="/coupons/add-new"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </Link>
      </div>
    </div>
  );
}
