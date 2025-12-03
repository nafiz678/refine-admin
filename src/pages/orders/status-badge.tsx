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
      bg: "bg-[#E6F0F2] dark:bg-[#3A4C53]",
      text: "text-[#7296A4] dark:text-[#CDDEE5]",
      label: "Pending",
    },
    PROCESSING: {
      bg: "bg-[#CDDEE5] dark:bg-[#2E3E45]",
      text: "text-[#4F7482] dark:text-[#9EBECB]",
      label: "Processing",
    },
    PACKAGING: {
      bg: "bg-[#9EBECB] dark:bg-[#263238]",
      text: "text-[#3B5A65] dark:text-[#E6F0F2]",
      label: "Packaging",
    },
    SHIPPED: {
      bg: "bg-[#9EBECB] dark:bg-[#1F2B31]",
      text: "text-[#2F4A55] dark:text-[#CDDEE5]",
      label: "Shipped",
    },
    DELIVERED: {
      bg: "bg-[#7296A4] dark:bg-[#1B252A]",
      text: "text-white dark:text-[#E6F0F2]",
      label: "Delivered",
    },
    CANCELLED: {
      bg: "bg-[#EFEFEF] dark:bg-[#2D2D2D]",
      text: "text-[#6B6B6B] dark:text-[#CDDEE5]",
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
