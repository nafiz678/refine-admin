import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import StatusBadge from "./status-badge";
import { Link } from "react-router";
import {
  PDFDownloadLink,
  PDFViewer,
} from "@react-pdf/renderer";
import { OrderInvoicePDF } from "./invoice-pdf";

export interface OrderRow {
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
  discountedPrice: number;
  updatedAt: string;
  paymentMethod: string;
  user: { name: string; email: string };
  product: {
    title: string;
    price: number;
    thumbnail: string | null;
    quantity: number;
  }[];
}

interface OrdersTableProps {
  orders: OrderRow[];
}

export default function OrdersTable({
  orders,
}: OrdersTableProps) {
  const [previewOrder, setPreviewOrder] =
    useState<OrderRow | null>(null);
  const [, setDeletingId] = useState<string | null>(null);

  const handleStatusChange = (
    orderId: string,
    newStatus: string
  ) => {
    toast.success(
      `Order status updated to ${newStatus + orderId}`
    );
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
                <td className="px-6 py-4 flex items-center gap-3">
                  <img
                    src={
                      order.product[0].thumbnail ||
                      "/placeholder.svg"
                    } // replace with the actual image URL field
                    alt={order.product[0].title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="text-sm text-foreground">
                    {order.product[0].title}
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
                    <SelectTrigger
                      className={`border-border bg-background h-8 w-32`}
                    >
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
                          <DropdownMenuItem className="text-destructive cursor-pointer">
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
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                {order.product[0].title}
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

      {/* PDF Preview Modal */}
      {previewOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              backgroundColor: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* PDF Preview */}
            <div style={{ flex: 1 }}>
              <PDFViewer width="100%" height="100%">
                <OrderInvoicePDF order={previewOrder} />
              </PDFViewer>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <Button
                variant={"outline"}
                onClick={() => setPreviewOrder(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Close
              </Button>

              <PDFDownloadLink
                document={
                  <OrderInvoicePDF order={previewOrder} />
                }
                fileName={`Invoice_${previewOrder.id}.pdf`}
                style={{
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)"
                }}
              >
                {({ loading }) =>
                  loading ? "Preparing..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
