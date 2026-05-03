import { StoreRow } from "@/lib/type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteStoreDialog({
  store,
  open,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  store: StoreRow | null;
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Delete store?
          </DialogTitle>
          <DialogDescription className="leading-6">
            This action cannot be undone. The store will be permanently removed
            from the admin panel and the public store locator.
          </DialogDescription>
        </DialogHeader>

        {store ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="font-semibold text-red-950">{store.store_name}</p>
            <p className="mt-1 text-sm text-red-700">
              {store.city ?? "No city"} / {store.area ?? "No area"}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-red-700">
              {store.address}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete store
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
