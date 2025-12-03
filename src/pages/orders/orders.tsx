import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import OrdersTable, { OrderRow } from "./order-table";
import { PageHeader } from "@/components/refine-ui/layout/page-header";


export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...MOCK_ORDERS];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.user.name.toLowerCase().includes(term) ||
          order.user.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter(
        (order) => order.orderStatus === selectedStatus
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
        break;
      case "amount_high":
        result.sort(
          (a, b) => b.paymentTotal - a.paymentTotal
        );
        break;
      case "amount_low":
        result.sort(
          (a, b) => a.paymentTotal - b.paymentTotal
        );
        break;
    }

    return result;
  }, [searchTerm, selectedStatus, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Orders"
          subtitle="Manage and track all your customer orders in one
            place"
        />

        {/* Filters & Controls */}
        <Card className="border-border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-12">
            {/* Search */}
            <div className="sm:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer, email, or product..."
                  className="border-border bg-background pl-10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectGroup>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectGroup>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="sm:col-span-2">
              <Button
                onClick={() => window.print()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm ||
            selectedStatus !== "all" ||
            sortBy !== "newest") && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Active filters:
              </span>
              {searchTerm && (
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedStatus !== "all" && (
                <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {
                    STATUS_OPTIONS.find(
                      (s) => s.value === selectedStatus
                    )?.label
                  }
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Orders Table */}
        <OrdersTable orders={filteredAndSortedOrders} />

        {/* No Results */}
        {filteredAndSortedOrders.length === 0 && (
          <Card className="border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No orders found. Try adjusting your filters or
              search criteria.
            </p>
          </Card>
        )}

        {/* Results Count */}
        <div className="text-right text-sm text-muted-foreground">
          Showing {filteredAndSortedOrders.length} of{" "}
          {MOCK_ORDERS.length} orders
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const MOCK_ORDERS: OrderRow[] = [
  {
    id: "a12f9c01-3d2b-4c6d-9a32-92c1e5abf101",
    coupon: "NEWYEAR10",
    createdAt: "2025-01-10T12:45:30.000Z",
    orderStatus: "PENDING",
    paymentTotal: 1000,
    paymentMethod: "COD",
    user: { name: "Rafid Hasan", email: "rafid@example.com" },
    product: [
      {
        title: "Men's Classic Denim Jacket",
        price: 1000,
        thumbnail: "https://picsum.photos/seed/denimjacket/300",
        quantity: 2,
      },
    ],
  },
  {
    id: "c48e92d3-88a9-42c5-a20e-52fa912bc200",
    coupon: null,
    createdAt: "2025-01-12T09:12:10.000Z",
    orderStatus: "PROCESSING",
    paymentTotal: 1600,
    paymentMethod: "BKASH",
    user: { name: "MD Nafizul Iqram", email: "nafizul@example.com" },
    product: [
      {
        title: "Premium Cotton T-Shirt",
        price: 1600,
        thumbnail: "https://picsum.photos/seed/cottontshirt/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "d28a22dc-91a4-48df-bf90-82eab3bd2211",
    coupon: "FLASH20",
    createdAt: "2025-01-13T18:25:50.000Z",
    orderStatus: "PACKAGING",
    paymentTotal: 3400,
    paymentMethod: "BKASH",
    user: { name: "Sadia Chowdhury", email: "sadia@example.com" },
    product: [
      {
        title: "Women's Winter Puffer Jacket",
        price: 3400,
        thumbnail: "https://picsum.photos/seed/pufferjacket/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "f92b1e76-212a-4a37-92fa-72bcfaeaa400",
    coupon: null,
    createdAt: "2025-01-14T11:55:00.000Z",
    orderStatus: "SHIPPED",
    paymentTotal: 5500,
    paymentMethod: "COD",
    user: { name: "Arif Rahman", email: "arif@example.com" },
    product: [
      {
        title: "Leather Bomber Jacket",
        price: 5500,
        thumbnail: "https://picsum.photos/seed/bomberjacket/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "e11c672f-5181-4b04-9e56-ae7f9003a588",
    coupon: "SAVE50",
    createdAt: "2025-01-15T15:20:10.000Z",
    orderStatus: "DELIVERED",
    paymentTotal: 1000,
    paymentMethod: "BKASH",
    user: { name: "Tanvir Ahmed", email: "tanvir@example.com" },
    product: [
      {
        title: "Unisex Baseball Cap",
        price: 1000,
        thumbnail: "https://picsum.photos/seed/baseballcap/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "ab992d7c-7fc3-4f9f-b92f-c4c5232bb999",
    coupon: null,
    createdAt: "2025-01-15T19:22:10.000Z",
    orderStatus: "CANCELLED",
    paymentTotal: 0,
    paymentMethod: "COD",
    user: { name: "Mahmud Hossain", email: "mahmud@example.com" },
    product: [
      {
        title: "Gaming Hoodie",
        price: 2500,
        thumbnail: "https://picsum.photos/seed/gaminghoodie/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "1f23df92-8ac2-4d21-b998-aaa1112bf001",
    coupon: "WINTER15",
    createdAt: "2025-01-17T10:20:15.000Z",
    orderStatus: "PENDING",
    paymentTotal: 2500,
    paymentMethod: "BKASH",
    user: { name: "Farhan Islam", email: "farhan@example.com" },
    product: [
      {
        title: "Men's Woolen Hoodie",
        price: 2500,
        thumbnail: "https://picsum.photos/seed/woolhoodie/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "2bd498a1-1123-4ee7-9012-99dfb88cd002",
    coupon: null,
    createdAt: "2025-01-18T08:50:05.000Z",
    orderStatus: "PROCESSING",
    paymentTotal: 1500,
    paymentMethod: "COD",
    user: { name: "Sajib Ahmed", email: "sajib@example.com" },
    product: [
      {
        title: "Women’s Casual T-Shirt",
        price: 1500,
        thumbnail: "https://picsum.photos/seed/womentshirt/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "3ef11abc-23dd-443d-91af-a1a1fbbcd003",
    coupon: "FREESHIP",
    createdAt: "2025-01-18T11:10:40.000Z",
    orderStatus: "PACKAGING",
    paymentTotal: 2000,
    paymentMethod: "BKASH",
    user: { name: "Samiya Aktar", email: "samiya@example.com" },
    product: [
      {
        title: "Women’s Long Coat",
        price: 2000,
        thumbnail: "https://picsum.photos/seed/womencoat/300",
        quantity: 1,
      },
    ],
  },
  {
    id: "4cc71e93-77f9-4e32-bbd9-cf44cdde4004",
    coupon: null,
    createdAt: "2025-01-19T14:25:50.000Z",
    orderStatus: "SHIPPED",
    paymentTotal: 1300,
    paymentMethod: "COD",
    user: { name: "Jahidul Hasan", email: "jahid@example.com" },
    product: [
      {
        title: "Men’s Slim Fit T-Shirt",
        price: 1300,
        thumbnail: "https://picsum.photos/seed/slimfittee/300",
        quantity: 1,
      },
    ],
  },
];


const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Highest Amount" },
  { value: "amount_low", label: "Lowest Amount" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];
