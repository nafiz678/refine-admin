import React, { useMemo } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Database } from "@/lib/supabase";
import { useDelete, useUpdate } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
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
import { type DateRange } from "react-day-picker";
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

export type CouponProp =
  Database["content"]["Tables"]["coupons"]["Row"];

export default function Coupon() {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<CouponProp>();

    return [
      columnHelper.accessor("code", {
        header: "Code",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),

      columnHelper.accessor("couponType", {
        header: "Type",
        cell: ({ getValue }) => (
          <Badge>
            {getValue() === "PERCENTAGE"
              ? "Percentage"
              : "Fixed Amount"}
          </Badge>
        ),
      }),

      columnHelper.display({
        header: "Discount",
        cell: ({ row }) =>
          row.original.couponType === "PERCENTAGE"
            ? `${row.original.discountPercentage}%`
            : `৳${row.original.discountAmount}`,
      }),

      columnHelper.accessor("minCartValue", {
        header: "Min Cart",
        cell: ({ getValue }) => `৳${getValue()}`,
      }),

      columnHelper.accessor("startDate", {
        header: "Start",
        cell: ({ getValue }) => {
          const d = toDate(getValue());
          return (
            <span>
              {d ? format(d, "dd MMM yyyy") : "-"}
            </span>
          );
        },
      }),

      columnHelper.accessor("endDate", {
        header: "End",
        cell: ({ getValue }) => {
          const d = toDate(getValue());
          return (
            <span>
              {d ? format(d, "dd MMM yyyy") : "-"}
            </span>
          );
        },
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
  }, []);

  const table = useTable<CouponProp>({
    columns,
    refineCoreProps: {
      syncWithLocation: true,
      resource: "coupons",
      meta: {
        schema: "content",
      },
    },
  });

  return (
    <section className="container mx-auto space-y-5 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Coupons</h1>

        <Link
          className={buttonVariants({ variant: "default" })}
          to="/coupons/add-new"
        >
          Add Coupon
        </Link>
      </div>

      <ListView>
        <DataTable table={table} />
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

    console.log(payload);

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
          toast.success(
            "Coupon deleted successfully" + row.original.id
          );
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
    <div className="flex items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            aria-label={`Edit coupon ${row.original.code}`}
            className="p-1"
            title="Edit date range"
            type="button"
          >
            <Pencil className="w-4 h-4 cursor-pointer hover:opacity-70" />
          </button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <div>
                Current:
                <span className="ml-2 font-medium">
                  {row.original.startDate &&
                  row.original.endDate
                    ? `${format(
                        new Date(row.original.startDate),
                        "dd MMM yyyy"
                      )} — ${format(
                        new Date(row.original.endDate),
                        "dd MMM yyyy"
                      )}`
                    : "Not set"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pick a range and click Save.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              //   disabled={saving}
              aria-label="Cancel editing coupon dates"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              //   disabled={saving || !dateRange?.from || !dateRange?.to}
              aria-label="Save coupon dates"
            >
              {"Save"}
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
            className="p-1"
          >
            <Trash2 className="w-4 h-4 text-destructive cursor-pointer hover:text-destructive" />
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Coupon?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will
              permanently delete the coupon
              <span className="font-semibold">
                {" "}
                "{row.original.code}"
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive text-foreground"
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
