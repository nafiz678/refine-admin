import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { Link } from "react-router";
import { Database } from "@/lib/supabase";
import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { useTable } from "@refinedev/react-table";
import { ListView } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseClient } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { useDelete } from "@refinedev/core";
import { Input } from "@/components/ui/input";

export type ProductRow =
  Database["public"]["Tables"]["product"]["Row"];

export type ProductVariant =
  Database["public"]["Tables"]["productVariant"]["Row"];

const Products = () => {
  const [search, setSearch] = useState("");
  const { data: variants } = useQuery({
    queryKey: ["productVariants"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("productVariant")
        .select("*");
      return data || [];
    },
  });
  const { mutate } = useDelete();

  const columns = React.useMemo(() => {
    const columnHelper = createColumnHelper<ProductRow>();

    return [
      columnHelper.accessor("title", {
        header: "Title",
        enableSorting: false,
        cell: ({ row }) => {
          const thumbnail = row.original.thumbnail;
          if (!thumbnail) return;
          const SUPABASE_URL = import.meta.env
            .VITE_SUPABASE_URL;

          const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${thumbnail}`;

          return (
            <div className="flex items-center gap-4 w-full">
              <img
                src={imageUrl}
                width={60}
                height={20}
                onError={(e) => {
                  e.currentTarget.src = "/fallback.jpg";
                }}
                alt=""
                className="size-12 object-cover"
              />
              <h2
                className="font-medium text-base opacity-90"
                title={row.original.title}
              >
                {row.original.title}
              </h2>
            </div>
          );
        },
        size: 400,
        meta: { disableSortBy: true },
      }),
      columnHelper.accessor("department", {
        header: "Department",
        cell: ({ row }) => row.original.department,
        size: 100,
        meta: { disableSortBy: true },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        enableSorting: true,
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        header: "Stock",
        enableSorting: false,
        cell: ({ row }) => {
          const productId = row.original.id;
          const relatedVariants =
            variants?.filter(
              (v) => v.productId === productId
            ) || [];
          const totalStock = relatedVariants.reduce(
            (sum, v) => sum + v.stockQty,
            0
          );

          return (
            <span className="font-medium">
              {totalStock}
            </span>
          );
        },
        size: 80,
        meta: { disableSortBy: true },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted m-1"
                >
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">
                    Open actions menu
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-lg space-y-1"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="p-0 rounded-lg">
                  <EditButton
                    recordItemId={row.original.id}
                    className="cursor-pointer gap-2 p-0"
                  />
                </DropdownMenuItem>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete item
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This
                        will permanently delete the item and
                        remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          mutate(
                            {
                              resource: "product",
                              id: row.original.id,
                            },
                            {
                              onSuccess: () => {
                                toast.success(
                                  `Item deleted: ${row.original.title}`
                                );
                              },
                              onError: () => {
                                toast.error(
                                  "Failed to delete item."
                                );
                              },
                            }
                          )
                        }
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 70,
      }),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]);

  // Integrate with react-table via useTable
  const table = useTable<ProductRow>({
    columns,
    refineCoreProps: {
      syncWithLocation: true,
      resource: "product",
      filters: {
        mode: "server",
      },
      // sorters: {
      //   initial: [
      //     {
      //       field: "createdAt",
      //       order: "asc"
      //     }
      //   ]
      // }
    },
  });

  // const sorters = table.refineCore.sorters;

  // Gets the current sort order for the fields
  // const currentSorterOrders = useMemo(() => {
  //   return {
  //     createdAt:
  //       sorters.find((item) => item.field === "createdAt")
  //         ?.order || "desc",
  //   };
  // }, [sorters]);

  // type SortField = "createdAt";

  // const toggleSort = (field: SortField) => {
  //   table.refineCore.setSorters([
  //     {
  //       field : "createdAt",
  //       order:
  //         currentSorterOrders[field] === "asc"
  //           ? "desc"
  //           : "asc",
  //     },
  //   ]);
  // };

  if (table.refineCore.tableQuery.isLoading) {
    return <Loader />;
  }

  return (
    <section className="container mx-auto space-y-5 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Products</h1>
        <div className="flex items-center justify-center gap-8">
          {/* Search Bar */}
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              table.refineCore.setFilters([
                {
                  field: "title",
                  value: value,
                  operator: "contains",
                },
              ]);
            }}
            className="w-60"
          />
          {/* <Button
            className="cursor-pointer border"
            onClick={() => toggleSort("createdAt")}
          >
            Sort date by{" "}
            {currentSorterOrders["createdAt"] === "asc"
              ? "desc"
              : "asc"}
          </Button> */}

          <Link
            className={buttonVariants({
              variant: "default",
            })}
            to="/products/add-new"
          >
            Add Product
          </Link>
        </div>
      </div>
      <div>
        <ListView>
          <DataTable table={table} />
        </ListView>
      </div>
    </section>
  );
};

export default Products;

function Loader() {
  return (
    <section className="container mx-auto space-y-6 p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 px-6 py-3 border-b border-border bg-muted/40">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16 hidden md:block" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 md:grid-cols-5 gap-4 px-6 py-4"
            >
              {/* Product info cell */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Status */}
              <Skeleton className="h-4 w-20" />

              {/* Created At */}
              <Skeleton className="h-4 w-28" />

              {/* Actions */}
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
