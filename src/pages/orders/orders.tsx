import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ListView } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import TableColumnHeader from "@/components/refine-ui/data-table/table-column-header";

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

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Database } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export type OrderRow =
  Database["public"]["Tables"]["order"]["Row"];

export type OrderExtended = OrderRow & {
  user: { name: string; email: string };
  product: {
    title: string;
    price: number;
    thumbnail: string | null;
  };
};

const Orders = () => {
  // const { mutate: updateOrder } = useUpdate();
  // const { mutate: deleteOrder } = useDelete();

  // const {
  //   data,
  //   query: { isLoading, isError },
  // } = useList<OrderExtended>({
  //   resource: "order",
  //   meta: {
  //     select: `
  //       *,
  //       user:profiles(name,email),
  //       product:product(title,price,thumbnail)
  //     `,
  //   },
  // });

  const columnHelper = createColumnHelper<OrderExtended>();

  const columns = [
    columnHelper.display({
      header: "Order",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-base">
            #{row.original.id.slice(0, 8)}
          </span>
          <span className="text-sm opacity-70">
            {row.original.product.title}
          </span>
          <span className="text-sm opacity-70">
            {row.original.user.name}
          </span>
        </div>
      ),
      size: 250,
    }),

    columnHelper.accessor("orderStatus", {
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.orderStatus}
          onValueChange={() =>
            toast.success("Status updated")
          }
        >
          <SelectTrigger className="m-1 rounded-xl h-8 px-2 text-xs">
            <SelectValue placeholder="Change" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="PENDING">
                Pending
              </SelectItem>
              <SelectItem value="PROCESSING">
                Processing
              </SelectItem>
              <SelectItem value="PACKAGING">
                Packaging
              </SelectItem>
              <SelectItem value="SHIPPED">
                Shipped
              </SelectItem>
              <SelectItem value="DELIVERED">
                Delivered
              </SelectItem>
              <SelectItem value="CANCELLED">
                Cancelled
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    }),

    columnHelper.accessor("paymentTotal", {
      header: "Amount",
      cell: ({ getValue }) => `৳${getValue()}`,
    }),

    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: ({ getValue }) =>
        new Date(getValue()).toLocaleDateString(),
    }),

    columnHelper.display({
      id: "actions",
      header: " ",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="p-2 rounded-md hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Order?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  toast.success(
                    `Order deleted ${row.original.id}`
                  )
                }
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
      size: 40,
    }),
  ];

  const table = useTable<OrderExtended>({
    columns,
    data: MOCK_ORDERS,
  });

  if (!MOCK_ORDERS) return <Loader />;

  return (
    <section className="container mx-auto space-y-5 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Orders</h1>
      </div>

      <ListView>
        <DataTable table={table} />
      </ListView>
    </section>
  );
};

export default Orders;

function Loader() {
  return (
    <section className="container mx-auto space-y-6 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 px-6 py-3 border-b border-border bg-muted/40">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16 hidden md:block" />
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 md:grid-cols-5 gap-4 px-6 py-4"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MOCK_ORDERS: OrderExtended[] = [
  {
    id: "a12f9c01-3d2b-4c6d-9a32-92c1e5abf101",
    coupon: "NEWYEAR10",
    createdAt: "2025-01-10T12:45:30.000Z",
    updatedAt: "2025-01-10T12:45:30.000Z",
    discountedPrice: 900,
    grandToken: null,
    orderStatus: "PENDING",
    paymentId: null,
    paymentMethod: "COD",
    paymentNumber: null,
    paymentRemaining: 0,
    paymentTotal: 1000,
    profileId: "user_001",
    refreshToken: null,
    shippingCost: 100,
    transactionId: null,

    user: {
      name: "Rafid Hasan",
      email: "rafid@example.com",
    },

    product: {
      title: "Wireless Gaming Mouse",
      price: 1000,
      thumbnail: "https://picsum.photos/seed/mouse/300",
    },
  },
  {
    id: "c48e92d3-88a9-42c5-a20e-52fa912bc200",
    coupon: null,
    createdAt: "2025-01-12T09:12:10.000Z",
    updatedAt: "2025-01-13T14:22:40.000Z",
    discountedPrice: 1500,
    grandToken: "TOKEN_ABC123",
    orderStatus: "PROCESSING",
    paymentId: "pay_0023",
    paymentMethod: "BKASH",
    paymentNumber: "01812345678",
    paymentRemaining: 0,
    paymentTotal: 1600,
    profileId: "user_002",
    refreshToken: "ref_token_128",
    shippingCost: 100,
    transactionId: "trx_983212",

    user: {
      name: "MD Nafizul Iqram",
      email: "nafizul@example.com",
    },

    product: {
      title: "Mechanical Keyboard",
      price: 1600,
      thumbnail: "https://picsum.photos/seed/keyboard/300",
    },
  },
  {
    id: "d28a22dc-91a4-48df-bf90-82eab3bd2211",
    coupon: "FLASH20",
    createdAt: "2025-01-13T18:25:50.000Z",
    updatedAt: "2025-01-14T10:00:10.000Z",
    discountedPrice: 3200,
    grandToken: null,
    orderStatus: "PACKAGING",
    paymentId: "pay_0099",
    paymentMethod: "BKASH",
    paymentNumber: "01799887766",
    paymentRemaining: 200,
    paymentTotal: 3400,
    profileId: "user_003",
    refreshToken: null,
    shippingCost: 200,
    transactionId: "trx_928342",

    user: {
      name: "Sadia Chowdhury",
      email: "sadia@example.com",
    },

    product: {
      title: "Bluetooth Speaker",
      price: 3400,
      thumbnail: "https://picsum.photos/seed/speaker/300",
    },
  },
  {
    id: "f92b1e76-212a-4a37-92fa-72bcfaeaa400",
    coupon: null,
    createdAt: "2025-01-14T11:55:00.000Z",
    updatedAt: "2025-01-15T08:34:30.000Z",
    discountedPrice: 5200,
    grandToken: null,
    orderStatus: "SHIPPED",
    paymentId: "pay_1055",
    paymentMethod: "COD",
    paymentNumber: null,
    paymentRemaining: 300,
    paymentTotal: 5500,
    profileId: "user_004",
    refreshToken: null,
    shippingCost: 300,
    transactionId: "trx_932123",

    user: {
      name: "Arif Rahman",
      email: "arif@example.com",
    },

    product: {
      title: "Smartwatch Pro",
      price: 5500,
      thumbnail: "https://picsum.photos/seed/watch/300",
    },
  },
  {
    id: "e11c672f-5181-4b04-9e56-ae7f9003a588",
    coupon: "SAVE50",
    createdAt: "2025-01-15T15:20:10.000Z",
    updatedAt: "2025-01-16T10:40:00.000Z",
    discountedPrice: 950,
    grandToken: null,
    orderStatus: "DELIVERED",
    paymentId: "pay_4321",
    paymentMethod: "BKASH",
    paymentNumber: "01944556677",
    paymentRemaining: 0,
    paymentTotal: 1000,
    profileId: "user_005",
    refreshToken: null,
    shippingCost: 50,
    transactionId: "trx_321421",

    user: {
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
    },

    product: {
      title: "USB-C Fast Charger",
      price: 1000,
      thumbnail: "https://picsum.photos/seed/charger/300",
    },
  },
  {
    id: "ab992d7c-7fc3-4f9f-b92f-c4c5232bb999",
    coupon: null,
    createdAt: "2025-01-15T19:22:10.000Z",
    updatedAt: "2025-01-16T11:00:00.000Z",
    discountedPrice: 0,
    grandToken: null,
    orderStatus: "CANCELLED",
    paymentId: null,
    paymentMethod: "COD",
    paymentNumber: null,
    paymentRemaining: 0,
    paymentTotal: 0,
    profileId: "user_006",
    refreshToken: null,
    shippingCost: 0,
    transactionId: null,

    user: {
      name: "Mahmud Hossain",
      email: "mahmud@example.com",
    },

    product: {
      title: "Gaming Headset",
      price: 2500,
      thumbnail: "https://picsum.photos/seed/headset/300",
    },
  },
];
