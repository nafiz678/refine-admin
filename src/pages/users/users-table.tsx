// import { deleteUser } from "@/app/_actions/user";
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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
// import DebouncedInput from "@/components/ui/debounced-input";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useNavigate } from "react-router";
import TableColumnHeader from "@/components/refine-ui/data-table/table-column-header";
import TableView from "./table-view";
import TablePagination from "./table-pagination";
import { UsersChart } from "./users-chart";
import DebouncedInput from "@/components/ui/debounced-input";
import { formatDate } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

const UsersTable = ({
  data,
  totalUsers,
}: {
  data: User[];
  totalUsers: number;
}) => {
  const [isPending, startTransition] = useTransition();
  const deleteUser = (id: string) =>
    toast.success(`User deleted ${id}`);

  const handleUserDelete = (id: string) => {
    startTransition(() => {
      deleteUser(id);
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-4">
            <img
              alt={row.original.user_metadata.name}
              className="size-12 rounded object-cover"
              height={48}
              loading="lazy"
              src={row.original.user_metadata.picture || "/placeholder.svg"}
              width={48}
            />

            <div>
              <p className="truncate text-base">
                {row.original.user_metadata.name ?? "User Name"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Email" />
      ),
      accessorKey: "email",
      cell: ({ row }) => (
        <p className="xl:font-semibold">
          {row.original.email}
        </p>
      ),
    },

    {
      header: "Created At",
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date)
          return <span className="text-muted">—</span>;

        return <span>{formatDate(date)}</span>;
      },
    },

    {
      accessorKey: "role",
      header: "Role",

      cell: ({ row }) => <p>{row.original.role}</p>,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/admin/users/${row.original.id}`}>
                Edit
              </Link>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger
                asChild
                disabled={isPending}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to remove this
                    product?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will
                    permanently delete your product and
                    remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    onClick={() =>
                      handleUserDelete(row.original.id)
                    }
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const [sorting, setSorting] =
    React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const navigate = useNavigate();
  const table = useReactTable({
    data,
    columns,
    rowCount: totalUsers,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualFiltering: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <section>
      <UsersChart />
      <div className="flex flex-wrap items-center justify-between gap-5 py-4">
        <DebouncedInput
          className="max-w-sm"
          onChange={(value) => {
            table.getColumn("email")?.setFilterValue(value);
            if (value) {
              navigate("/users");
            }
          }}
          placeholder={"Filter by email"}
          value={
            (table
              .getColumn("email")
              ?.getFilterValue() as string) ?? ""
          }
        />
        <div className="max-w-sm"></div>

        <div className="flex items-center space-x-2">
          <CustomTableFacetedFilter />
          <TableView table={table} />
        </div>
      </div>
      <div className="rounded-xl border">
        <div className="p-2 ">
          <h2 className="font-semibold p-1">Users List</h2>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={
                    row.getIsSelected() && "selected"
                  }
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          table={table}
          text={"Users"}
          total={totalUsers}
        />
      </div>
    </section>
  );
};

export default UsersTable;

const RoleOptions = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
];
type Status = {
  value: string;
  label: string;
};
const CustomTableFacetedFilter = () => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useIsMobile();
  const [selectedStatus, setSelectedStatus] =
    React.useState<Status | null>(null);

  if (!isDesktop) {
    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className="w-[150px] justify-start"
            variant="outline"
          >
            {selectedStatus ? (
              selectedStatus.label
            ) : (
              <>Role</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[200px] p-0"
        >
          <StatusList
            setOpen={setOpen}
            setSelectedStatus={setSelectedStatus}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button
          className="w-[150px] justify-start"
          variant="outline"
        >
          {selectedStatus ? (
            selectedStatus.label
          ) : (
            <>Role</>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList
            setOpen={setOpen}
            setSelectedStatus={setSelectedStatus}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function StatusList({
  setOpen,
  setSelectedStatus,
}: {
  setOpen: (open: boolean) => void;
  setSelectedStatus: (status: Status | null) => void;
}) {
  const router = useNavigate();
  // const { filterBy } = useSearchParams({ from: "/admin/users/" });

  const handleSelectFilter = (value: string | null) => {
    if (value) {
      router("/admin/users");
      setOpen(false);
    } else {
      router("/admin/users");

      // navigate({
      //   to: "/admin/users",
      //   search: (prev) => {
      //     const { ...rest } = prev;
      //     return rest;
      //   },
      // });

      setOpen(false);
      // const newParams = new URLSearchParams(searchParams.toString());
      // newParams.delete("filterBy");
      // router.push(`?${newParams.toString()}`);
    }
  };
  return (
    <Command>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {RoleOptions.map((status) => (
            <CommandItem
              // className={filterBy === status.value ? "bg-muted" : ""}
              key={status.value}
              onSelect={(value) => {
                setSelectedStatus(
                  RoleOptions.find(
                    (priority) => priority.value === value
                  ) || null
                );
                handleSelectFilter(value);
              }}
              value={status.value}
            >
              {status.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem
            className="justify-center text-center"
            onSelect={() => {
              setSelectedStatus(null);
              handleSelectFilter(null);
            }}
          >
            Clear filters
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
