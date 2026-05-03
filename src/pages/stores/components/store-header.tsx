import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/refine-ui/layout/page-header";

export function StoreHeader({
  isRefreshing,
  onRefresh,
  onCreate,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-4xl p-6 shadow-sm lg:flex-row lg:items-end">
      <PageHeader
        title="Manage partner stores"
        subtitle="Add, edit, filter, activate, deactivate, and delete every store shown on the public store locator page."
        className="text-3xl"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="cursor-pointer"
        >
          <RefreshCcw
            className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>

        <Button onClick={onCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add store
        </Button>
      </div>
    </div>
  );
}
