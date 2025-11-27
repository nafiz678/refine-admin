interface StatusBadgeProps {
  status:
    | "PENDING"
    | "PROCESSING"
    | "PACKAGING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-950",
      text: "text-amber-800 dark:text-amber-200",
      label: "Pending",
    },
    PROCESSING: {
      bg: "bg-blue-100 dark:bg-blue-950",
      text: "text-blue-800 dark:text-blue-200",
      label: "Processing",
    },
    PACKAGING: {
      bg: "bg-purple-100 dark:bg-purple-950",
      text: "text-purple-800 dark:text-purple-200",
      label: "Packaging",
    },
    SHIPPED: {
      bg: "bg-indigo-100 dark:bg-indigo-950",
      text: "text-indigo-800 dark:text-indigo-200",
      label: "Shipped",
    },
    DELIVERED: {
      bg: "bg-emerald-100 dark:bg-emerald-950",
      text: "text-emerald-800 dark:text-emerald-200",
      label: "Delivered",
    },
    CANCELLED: {
      bg: "bg-red-100 dark:bg-red-950",
      text: "text-red-800 dark:text-red-200",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-md ${config.bg} ${config.text} px-2 py-1 text-xs font-semibold`}
    >
      {config.label}
    </span>
  );
}
