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
import OrdersTable from "./order-table";

interface OrderRow {
  id: string;
  coupon: string | null;
  createdAt: string;
  updatedAt: string;
  discountedPrice: number;
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
          order.user.email.toLowerCase().includes(term) ||
          order.product.title
            .toLowerCase()
            .includes(term) ||
          order.product.price.toString().includes(term)
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

  const handleExport = () => {
    const csv = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Product",
        "Amount",
        "Status",
        "Date",
      ],
      ...filteredAndSortedOrders.map((order) => [
        order.id,
        order.user.name,
        order.user.email,
        order.product.title,
        order.paymentTotal,
        order.orderStatus,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ];

    const csvContent = csv
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your customer orders in one
            place
          </p>
        </div>

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
                onClick={handleExport}
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

const MOCK_ORDERS: OrderRow[] = [
  {
    id: "a12f9c01-3d2b-4c6d-9a32-92c1e5abf101",
    coupon: "NEWYEAR10",
    createdAt: "2025-01-10T12:45:30.000Z",
    updatedAt: "2025-01-10T12:45:30.000Z",
    discountedPrice: 900,
    orderStatus: "PENDING",
    paymentTotal: 1000,
    paymentMethod: "COD",
    user: {
      name: "Rafid Hasan",
      email: "rafid@example.com",
    },
    product: {
      title: "Men's Classic Denim Jacket",
      price: 1000,
      thumbnail:
        "https://picsum.photos/seed/denimjacket/300",
    },
  },
  {
    id: "c48e92d3-88a9-42c5-a20e-52fa912bc200",
    coupon: null,
    createdAt: "2025-01-12T09:12:10.000Z",
    updatedAt: "2025-01-13T14:22:40.000Z",
    discountedPrice: 1500,
    orderStatus: "PROCESSING",
    paymentTotal: 1600,
    paymentMethod: "BKASH",
    user: {
      name: "MD Nafizul Iqram",
      email: "nafizul@example.com",
    },
    product: {
      title: "Premium Cotton T-Shirt",
      price: 1600,
      thumbnail:
        "https://picsum.photos/seed/cottontshirt/300",
    },
  },
  {
    id: "d28a22dc-91a4-48df-bf90-82eab3bd2211",
    coupon: "FLASH20",
    createdAt: "2025-01-13T18:25:50.000Z",
    updatedAt: "2025-01-14T10:00:10.000Z",
    discountedPrice: 3200,
    orderStatus: "PACKAGING",
    paymentTotal: 3400,
    paymentMethod: "BKASH",
    user: {
      name: "Sadia Chowdhury",
      email: "sadia@example.com",
    },
    product: {
      title: "Women's Winter Puffer Jacket",
      price: 3400,
      thumbnail:
        "https://picsum.photos/seed/pufferjacket/300",
    },
  },
  {
    id: "f92b1e76-212a-4a37-92fa-72bcfaeaa400",
    coupon: null,
    createdAt: "2025-01-14T11:55:00.000Z",
    updatedAt: "2025-01-15T08:34:30.000Z",
    discountedPrice: 5200,
    orderStatus: "SHIPPED",
    paymentTotal: 5500,
    paymentMethod: "COD",
    user: {
      name: "Arif Rahman",
      email: "arif@example.com",
    },
    product: {
      title: "Leather Bomber Jacket",
      price: 5500,
      thumbnail:
        "https://picsum.photos/seed/bomberjacket/300",
    },
  },
  {
    id: "e11c672f-5181-4b04-9e56-ae7f9003a588",
    coupon: "SAVE50",
    createdAt: "2025-01-15T15:20:10.000Z",
    updatedAt: "2025-01-16T10:40:00.000Z",
    discountedPrice: 950,
    orderStatus: "DELIVERED",
    paymentTotal: 1000,
    paymentMethod: "BKASH",
    user: {
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
    },
    product: {
      title: "Unisex Baseball Cap",
      price: 1000,
      thumbnail:
        "https://picsum.photos/seed/baseballcap/300",
    },
  },
  {
    id: "ab992d7c-7fc3-4f9f-b92f-c4c5232bb999",
    coupon: null,
    createdAt: "2025-01-15T19:22:10.000Z",
    updatedAt: "2025-01-16T11:00:00.000Z",
    discountedPrice: 0,
    orderStatus: "CANCELLED",
    paymentTotal: 0,
    paymentMethod: "COD",
    user: {
      name: "Mahmud Hossain",
      email: "mahmud@example.com",
    },
    product: {
      title: "Gaming Hoodie",
      price: 2500,
      thumbnail:
        "https://picsum.photos/seed/gaminghoodie/300",
    },
  },
  {
    id: "1f23df92-8ac2-4d21-b998-aaa1112bf001",
    coupon: "WINTER15",
    createdAt: "2025-01-17T10:20:15.000Z",
    updatedAt: "2025-01-17T10:20:15.000Z",
    discountedPrice: 2200,
    orderStatus: "PENDING",
    paymentTotal: 2500,
    paymentMethod: "BKASH",
    user: {
      name: "Farhan Islam",
      email: "farhan@example.com",
    },
    product: {
      title: "Men's Woolen Hoodie",
      price: 2500,
      thumbnail:
        "https://picsum.photos/seed/woolhoodie/300",
    },
  },
  {
    id: "2bd498a1-1123-4ee7-9012-99dfb88cd002",
    coupon: null,
    createdAt: "2025-01-18T08:50:05.000Z",
    updatedAt: "2025-01-18T09:30:15.000Z",
    discountedPrice: 1400,
    orderStatus: "PROCESSING",
    paymentTotal: 1500,
    paymentMethod: "COD",
    user: {
      name: "Sajib Ahmed",
      email: "sajib@example.com",
    },
    product: {
      title: "Women’s Casual T-Shirt",
      price: 1500,
      thumbnail:
        "https://picsum.photos/seed/womentshirt/300",
    },
  },
  {
    id: "3ef11abc-23dd-443d-91af-a1a1fbbcd003",
    coupon: "FREESHIP",
    createdAt: "2025-01-18T11:10:40.000Z",
    updatedAt: "2025-01-18T11:10:40.000Z",
    discountedPrice: 1800,
    orderStatus: "PACKAGING",
    paymentTotal: 2000,
    paymentMethod: "BKASH",
    user: {
      name: "Samiya Aktar",
      email: "samiya@example.com",
    },
    product: {
      title: "Women’s Long Coat",
      price: 2000,
      thumbnail: "https://picsum.photos/seed/womencoat/300",
    },
  },
  {
    id: "4cc71e93-77f9-4e32-bbd9-cf44cdde4004",
    coupon: null,
    createdAt: "2025-01-19T14:25:50.000Z",
    updatedAt: "2025-01-19T14:25:50.000Z",
    discountedPrice: 1200,
    orderStatus: "SHIPPED",
    paymentTotal: 1300,
    paymentMethod: "COD",
    user: {
      name: "Jahidul Hasan",
      email: "jahid@example.com",
    },
    product: {
      title: "Men’s Slim Fit T-Shirt",
      price: 1300,
      thumbnail:
        "https://picsum.photos/seed/slimfittee/300",
    },
  },
  {
    id: "5aa3ee01-9281-49c7-bb23-bb32123ef005",
    coupon: "SUMMER5",
    createdAt: "2025-01-19T16:30:20.000Z",
    updatedAt: "2025-01-19T17:00:00.000Z",
    discountedPrice: 850,
    orderStatus: "DELIVERED",
    paymentTotal: 900,
    paymentMethod: "BKASH",
    user: {
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
    },
    product: {
      title: "Women’s Crop Top",
      price: 900,
      thumbnail: "https://picsum.photos/seed/croptop/300",
    },
  },
  {
    id: "6bb99e21-8821-4ea1-a028-fc44bbde6006",
    coupon: null,
    createdAt: "2025-01-20T09:00:10.000Z",
    updatedAt: "2025-01-20T09:20:10.000Z",
    discountedPrice: 3000,
    orderStatus: "DELIVERED",
    paymentTotal: 3200,
    paymentMethod: "COD",
    user: {
      name: "Ayman Chowdhury",
      email: "ayman@example.com",
    },
    product: {
      title: "Men's Winter Parka",
      price: 3200,
      thumbnail: "https://picsum.photos/seed/parka/300",
    },
  },
  {
    id: "7cc1ab12-82a4-4b91-a120-991aabb76007",
    coupon: "OFF20",
    createdAt: "2025-01-21T10:25:00.000Z",
    updatedAt: "2025-01-21T10:25:00.000Z",
    discountedPrice: 2200,
    orderStatus: "PENDING",
    paymentTotal: 2500,
    paymentMethod: "BKASH",
    user: {
      name: "Tania Rahim",
      email: "tania@example.com",
    },
    product: {
      title: "Women’s Sports Jacket",
      price: 2500,
      thumbnail:
        "https://picsum.photos/seed/sportsjacket/300",
    },
  },
  {
    id: "8d99cd23-3322-4f31-8c44-aa11ddaa8008",
    coupon: null,
    createdAt: "2025-01-21T15:45:12.000Z",
    updatedAt: "2025-01-21T16:00:00.000Z",
    discountedPrice: 650,
    orderStatus: "PROCESSING",
    paymentTotal: 700,
    paymentMethod: "COD",
    user: {
      name: "Rahat Mahmud",
      email: "rahat@example.com",
    },
    product: {
      title: "Unisex Cotton Cap",
      price: 700,
      thumbnail: "https://picsum.photos/seed/cottoncap/300",
    },
  },
  {
    id: "9f12aa33-8821-4de1-a112-bb0099aa9009",
    coupon: "STYLE10",
    createdAt: "2025-01-22T11:35:55.000Z",
    updatedAt: "2025-01-22T12:00:00.000Z",
    discountedPrice: 1100,
    orderStatus: "PACKAGING",
    paymentTotal: 1200,
    paymentMethod: "BKASH",
    user: {
      name: "Mehzabin Yasmin",
      email: "mehzabin@example.com",
    },
    product: {
      title: "Women's Full Sleeve T-Shirt",
      price: 1200,
      thumbnail: "https://picsum.photos/seed/fulltees/300",
    },
  },
  {
    id: "10eeab44-6671-4a22-bc32-cd8899bb0010",
    coupon: null,
    createdAt: "2025-01-23T14:40:15.000Z",
    updatedAt: "2025-01-23T14:40:15.000Z",
    discountedPrice: 2000,
    orderStatus: "DELIVERED",
    paymentTotal: 2200,
    paymentMethod: "COD",
    user: {
      name: "Rayhan Karim",
      email: "rayhan@example.com",
    },
    product: {
      title: "Men’s Zip-Up Hoodie",
      price: 2200,
      thumbnail: "https://picsum.photos/seed/ziphoodie/300",
    },
  },
  {
    id: "11ccfaa1-3299-4cca-aa21-dc7722be1011",
    coupon: null,
    createdAt: "2025-01-24T09:10:45.000Z",
    updatedAt: "2025-01-24T10:00:00.000Z",
    discountedPrice: 2800,
    orderStatus: "SHIPPED",
    paymentTotal: 3000,
    paymentMethod: "BKASH",
    user: {
      name: "Samira Islam",
      email: "samira@example.com",
    },
    product: {
      title: "Women’s Leather Jacket",
      price: 3000,
      thumbnail: "https://picsum.photos/seed/wleather/300",
    },
  },
  {
    id: "12ffaa33-119a-4bb3-8832-cc11ddee1212",
    coupon: "HOTDEAL",
    createdAt: "2025-01-25T08:15:00.000Z",
    updatedAt: "2025-01-25T09:00:00.000Z",
    discountedPrice: 1800,
    orderStatus: "PROCESSING",
    paymentTotal: 2000,
    paymentMethod: "COD",
    user: {
      name: "Nabil Hasan",
      email: "nabil@example.com",
    },
    product: {
      title: "Men’s Polo Shirt",
      price: 2000,
      thumbnail: "https://picsum.photos/seed/poloshirt/300",
    },
  },
  {
    id: "13ddeea3-4422-4a11-bc90-bb1133cc1313",
    coupon: null,
    createdAt: "2025-01-26T13:22:10.000Z",
    updatedAt: "2025-01-26T13:22:10.000Z",
    discountedPrice: 950,
    orderStatus: "DELIVERED",
    paymentTotal: 1000,
    paymentMethod: "BKASH",
    user: {
      name: "Tahmid Islam",
      email: "tahmid@example.com",
    },
    product: {
      title: "Printed Graphic T-Shirt",
      price: 1000,
      thumbnail:
        "https://picsum.photos/seed/graphictee/300",
    },
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
