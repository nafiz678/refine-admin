import { Badge } from "@/components/ui/badge";
import { StoreType } from "@/lib/type";
import { cn } from "@/lib/utils";

export function StoreTypeBadge({ type }: { type: StoreType }) {
  return (
    <Badge
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-bold",
        type === "Prime Shop" && "border-neutral-900 bg-neutral-950 text-white",
        type === "Flex Shop" && "border-amber-200 bg-amber-100 text-amber-950",
        type === "Niche Shop" &&
          "border-emerald-200 bg-emerald-100 text-emerald-950",
      )}
    >
      {type}
    </Badge>
  );
}
