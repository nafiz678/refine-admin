import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  Copy,
  Edit,
  ExternalLink,
  Facebook,
  ImageIcon,
  Loader2,
  MapPin,
  MoreHorizontal,
  Store as StoreIcon,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoreRow } from "@/lib/type";
import { StoreTypeBadge } from "./store-type-badge";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/lib/utils";
import { PAGE_SIZE_OPTIONS } from "./constants";
import { getStoreImagePreviewUrl } from "./store-image-upload";

export function StoreTable({
  rows,
  page,
  pageCount,
  pageSize,
  selectedRows,
  rowSelection,
  isLoading,
  isFetching,
  isDeleting,
  isDeletingMany,
  storeToDelete,
  setPage,
  setPageSize,
  setRowSelection,
  setStoreToDelete,
  setBulkDeleteOpen,
  openEdit,
  onToggleActive,
}: {
  rows: StoreRow[];
  page: number;
  pageCount: number;
  pageSize: number;
  selectedRows: string[];
  rowSelection: RowSelectionState;
  isLoading: boolean;
  isFetching: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  storeToDelete: StoreRow | null;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  setStoreToDelete: Dispatch<SetStateAction<StoreRow | null>>;
  setBulkDeleteOpen: Dispatch<SetStateAction<boolean>>;
  openEdit: (store: StoreRow) => void;
  onToggleActive: (store: StoreRow) => void;
}) {
  const columns = useMemo<ColumnDef<StoreRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
            aria-label="Select all stores on this page"
            className="cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label={`Select ${row.original.store_name}`}
            className="cursor-pointer"
          />
        ),
      },
      {
        accessorKey: "store_name",
        header: "Store",
        cell: ({ row }) => {
          const store = row.original;

          return (
            <div className="flex min-w-[260px] items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border">
                {store.image ? (
                  <img
                    src={getStoreImagePreviewUrl(store.image)}
                    alt={store.store_name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div>
                <div className="font-semibold">
                  {store.store_name}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {store.city ?? "No city"} / {store.area ?? "No area"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "store_type",
        header: "Type",
        cell: ({ row }) => <StoreTypeBadge type={row.original.store_type} />,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-[340px] text-sm text-muted-foreground">
            {row.original.address}
          </p>
        ),
      },
      {
        accessorKey: "contact_no",
        header: "Contact",
        cell: ({ row }) => (
          <a
            className="font-medium hover:underline"
            href={`tel:${row.original.contact_no}`}
          >
            {row.original.contact_no}
          </a>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const store = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => openEdit(store)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit store
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(store.id)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy ID
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <a
                    href={store.google_map_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Open map
                  </a>
                </DropdownMenuItem>

                {store.facebook_page_url ? (
                  <DropdownMenuItem asChild>
                    <a
                      href={store.facebook_page_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Facebook className="mr-2 h-4 w-4" /> Facebook
                    </a>
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onToggleActive(store)}>
                  {store.is_active ? (
                    <XCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {store.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting}
                  onClick={() => setStoreToDelete(store)}
                >
                  {isDeleting && storeToDelete?.id === store.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isDeleting, onToggleActive, openEdit, setStoreToDelete, storeToDelete?.id],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount,
  });

  return (
    <>
      {selectedRows.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border p-4 shadow-sm">
          <p className="text-sm font-medium">
            {selectedRows.length} store
            {selectedRows.length > 1 ? "s" : ""} selected
          </p>

          <Button
            variant="destructive"
            disabled={isDeletingMany}
            onClick={() => setBulkDeleteOpen(true)}
          >
            {isDeletingMany ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeletingMany ? "Deleting selected..." : "Delete selected"}
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap py-4 font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell
                        colSpan={columns.length}
                        className="h-16 animate-pulse"
                      />
                    </TableRow>
                  ))
                : null}

              {!isLoading && table.getRowModel().rows.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && !table.getRowModel().rows.length ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-56 text-center"
                  >
                    <StoreIcon className="mx-auto h-8 w-8" />
                    <p className="mt-3 font-semibold">No stores found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing filters or add a new store.
                    </p>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {pageCount}.{" "}
            {isFetching ? "Updating..." : `${rows.length} visible rows.`}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="cursor-pointer"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= pageCount || isFetching}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
