import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BulkDeleteStoresDialog({
  open,
  selectedCount,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  selectedCount: number;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl sm:max-w-md">
        <AlertDialogHeader>
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <AlertDialogTitle className="text-2xl font-semibold tracking-tight">
            Delete selected stores?
          </AlertDialogTitle>

          <AlertDialogDescription className="leading-6 text-neutral-600">
            You are about to permanently delete {selectedCount} selected store
            {selectedCount > 1 ? "s" : ""}. This will remove them from the admin
            panel and the public store locator. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">
            {selectedCount} store{selectedCount > 1 ? "s" : ""}
          </span>{" "}
          selected for deletion.
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="rounded-full">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting || selectedCount === 0}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="rounded-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete selected"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
