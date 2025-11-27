import { useState } from "react";
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import StatusBadge from "./status-badge";

interface OrderRow {
  id: string;
  coupon: string | null;
  createdAt: string;
  orderStatus:
    | "PENDING"
    | "PROCESSING"
    | "PACKAGING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentTotal: number;
  paymentMethod: string;
  user: { name: string; email: string };
  product: {
    title: string;
    price: number;
    thumbnail: string | null;
  };
}

interface OrdersTableProps {
  orders: OrderRow[];
}

export default function OrdersTable({
  orders,
}: OrdersTableProps) {
  const [, setDeletingId] = useState<
    string | null
  >(null);

  const handleStatusChange = (
    orderId: string,
    newStatus: string
  ) => {
    toast.success(`Order status updated to ${newStatus + orderId}`);
  };

  const handleDelete = (orderId: string) => {
    toast.success(
      `Order ${orderId.slice(0, 8)} deleted successfully`
    );
    setDeletingId(null);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.paymentMethod}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      {order.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">
                    {order.product.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-foreground">
                    ৳{order.paymentTotal.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={order.orderStatus}
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value)
                    }
                  >
                    <SelectTrigger className="border-border bg-background h-8 w-32">
                      <StatusBadge
                        status={order.orderStatus}
                      />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card">
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
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary/10 h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Order?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                            The order{" "}
                            {order.id
                              .slice(0, 8)
                              .toUpperCase()}{" "}
                            will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(order.id)
                            }
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {order.user.name}
                </p>
              </div>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="mb-3 space-y-1 text-sm">
              <p className="text-muted-foreground">
                {order.product.title}
              </p>
              <p className="font-semibold text-foreground">
                ৳{order.paymentTotal.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={order.orderStatus}
                onValueChange={(value) =>
                  handleStatusChange(order.id, value)
                }
              >
                <SelectTrigger className="border-border bg-background h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/10 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete Order?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The
                      order will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(order.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
