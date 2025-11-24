import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useRouter, useSearch } from "@tanstack/react-router";
import type { Table } from "@tanstack/react-table";
// import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type TablePaginationProps<TData> = {
  table: Table<TData>;
  text: string;
  total?: number;
};
const TablePagination = <TData,>({
  table,
  text,
  total,
}: TablePaginationProps<TData>) => {
  // const url = text.toLowerCase();
  // const searchParams = useSearch({ from: "/admin/products" });
  // const page = Number(searchParams.page) || 1;
  // const limit = Number(searchParams.limit) || 10;
  // const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="flex-1 text-muted-foreground text-sm">
        {total} {text}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              // router.navigate({
              //   href: `?page=${page}&limit=${value}`,
              //   to: "/admin/products",
              //   search: {
              //     page,
              //     limit,
              //   },
              // });
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="font-medium text-sm">Rows per page</p>
        </div>
        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hidden size-8 p-0 lg:flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              table.setPageIndex(0);
              // router.navigate({
              //   to: "/admin/products", // or your route path
              //   search: {
              //     page: 1,
              //     limit,
              //   },
              //   replace: true,
              // });
            }}
            variant="outline"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            className="size-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              table.previousPage();
              // router.navigate({
              //   to: "/admin/products",
              //   search: (prev) => ({
              //     ...prev,
              //     page: (prev.page ?? 1) - 1,
              //     limit: prev.limit ?? limit,
              //   }),
              //   replace: true,
              // });
            }}
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            className="size-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => {
              table.nextPage();
              // router.navigate({
              //   to: "/admin/products",
              //   search: (prev) => ({
              //     ...prev,
              //     page: (prev.page ?? 1) + 1,
              //     limit: prev.limit ?? limit,
              //   }),
              // });
            }}
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            className="hidden size-8 p-0 lg:flex"
            disabled={!table.getCanNextPage()}
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
              // router.navigate({
              //   href: `?page=${table.getPageCount()}&limit=${limit}`,
              //   to: "/admin/products",
              //   search: (prev) => ({
              //     ...prev,
              //     page: table.getPageCount(),
              //     limit,
              //   }),
              // });
            }}
            variant="outline"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
