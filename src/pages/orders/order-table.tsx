import { useMemo, useState } from "react";
import {
  Trash2,
  Eye,
  MoreHorizontal,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { Link } from "react-router";
import { Database } from "@/lib/supabase";
import StatusBadge from "./status-badge";
import InvoiceDrawer from "./invoice-preview-dialog";
import { supabaseClient } from "@/lib";

export type OrderRow =
  Database["public"]["Tables"]["order"]["Row"];

interface OrderProduct {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
}

export type EnrichedOrderRow = OrderRow & {
  userEmail: string;
  userName: string;
  products: OrderProduct[];
};
interface OrdersTableProps {
  orders: EnrichedOrderRow[];
  isLoading?: boolean;
  searchTerm: string;
}

export default function OrdersTable({
  orders,
  searchTerm = "",
}: OrdersTableProps) {
  const [localOrders, setLocalOrders] =
    useState<EnrichedOrderRow[]>(orders);
  const [previewOrder, setPreviewOrder] =
    useState<EnrichedOrderRow | null>(null);
  // const [, setDeletingId] = useState<string | null>(null);
  const [localStatusMap, setLocalStatusMap] = useState<
    Record<string, OrderRow["orderStatus"]>
  >({});

  // Filter orders client-side
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return localOrders;

    const term = searchTerm.toLowerCase();

    return localOrders.filter((order) => {
      const emailMatch = order.userEmail
        ?.toLowerCase()
        .includes(term);
      const nameMatch = order.userName
        ?.toLowerCase()
        .includes(term);
      const productMatch = order.products?.some((p) =>
        p.title?.toLowerCase().includes(term)
      );
      return emailMatch || nameMatch || productMatch;
    });
  }, [localOrders, searchTerm]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderRow["orderStatus"]
  ) => {
    const previous = localStatusMap[orderId];

    // immediate UI update
    setLocalStatusMap((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));

    const toastId = toast.loading(
      "Updating order status..."
    );

    try {
      const { error } = await supabaseClient
        .from("order")
        .update({ orderStatus: newStatus })
        .eq("id", orderId);

      if (error) {
        // rollback UI
        setLocalStatusMap((prev) => ({
          ...prev,
          [orderId]: previous,
        }));

        toast.error("Failed to update order status.");
        console.error(error);
        return;
      }

      toast.success(
        `Order status updated to ${newStatus}`,
        {
          id: toastId,
        }
      );
    } catch (err) {
      toast.error("Status update failed:" + err);
      setLocalStatusMap((prev) => ({
        ...prev,
        [orderId]: previous,
      }));
    }
  };

  const handleDelete = async (orderId: string) => {
    const toastId = toast.loading("Deleting order...");

    try {
      // Optimistic UI: remove order locally
      setLocalOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );

      const { error } = await supabaseClient
        .from("order")
        .delete()
        .eq("id", orderId);

      if (error) {
        toast.error("Failed to delete order", {
          id: toastId,
        });
        // rollback UI if needed
        setLocalOrders(orders);
        return;
      }

      toast.success("Order deleted successfully", {
        id: toastId,
      });
    } catch (err) {
      toast.error("Error deleting order", { id: toastId });
      console.error(err);
      setLocalOrders(orders); // rollback
    }
  };

  if (!filteredOrders || filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No orders yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Orders will appear here once they are placed.
        </p>
      </div>
    );
  }

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
            {filteredOrders?.map((order) => {
              return (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        #
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm">
                        {order.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.userEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={`${
                        import.meta.env.VITE_SUPABASE_URL
                      }/storage/v1/object/public/${
                        order?.products[0].image
                      }`}
                      alt={order.products[0].title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        const target =
                          e.currentTarget as HTMLImageElement;
                        target.src = "/fallback.jpg";
                      }}
                    />
                    <span className="text-sm text-foreground">
                      {order.products[0].title}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">
                      ৳{order.paymentTotal.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      value={
                        localStatusMap[order.id] ??
                        order.orderStatus
                      }
                      onValueChange={(value) =>
                        handleStatusChange(
                          order.id,
                          value as OrderRow["orderStatus"]
                        )
                      }
                    >
                      <SelectTrigger
                        className={`border-border bg-background h-8 w-32`}
                      >
                        <StatusBadge
                          status={
                            localStatusMap[order.id] ??
                            order.orderStatus
                          }
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-44"
                      >
                        {/* Print Invoice */}
                        <DropdownMenuItem
                          onClick={() =>
                            setPreviewOrder(order)
                          }
                          className="cursor-pointer"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print Invoice
                        </DropdownMenuItem>

                        {/* Order Summary */}
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/orders/summary/${order.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Order Summary
                          </Link>
                        </DropdownMenuItem>

                        {/* Delete Order */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) =>
                                e.preventDefault()
                              }
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                              Delete Order
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Order?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be
                                undone. The order{" "}
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {filteredOrders.map((order) => (
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
                  {order.userName}
                </p>
              </div>
              <StatusBadge
                status={
                  localStatusMap[order.id] ??
                  order.orderStatus
                }
              />
            </div>
            <div className="mb-3 space-y-1 text-sm">
              <p className="text-muted-foreground">
                {/* {order.product[0].title} */}
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
                  handleStatusChange(
                    order.id,
                    value as OrderRow["orderStatus"]
                  )
                }
              >
                <SelectTrigger className="border-border bg-background h-8 flex-1 text-xs">
                  <StatusBadge
                    status={
                      localStatusMap[order.id] ??
                      order.orderStatus
                    }
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

      {/* PDF Preview Modal */}
      <InvoiceDrawer
        previewOrder={previewOrder}
        setPreviewOrder={setPreviewOrder}
      />
    </div>
  );
}
