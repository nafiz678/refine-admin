import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category, CategoryFormData } from "../category";
import { toast } from "sonner";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: Category;
  title?: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Add New Category",
}: CategoryModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      title: { value: string };
    };
    const name = target.title.value.trim();

    if (!name) {
      toast.error("Title is required");
      return;
    }
    console.log(name);
    onSave({ name: name });
  };

  return (
    <Dialog
      key={initialData?.name ?? "new"}
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          key={initialData?.name ?? "new"}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-foreground font-medium"
            >
              Category Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Jackets, Fashion"
              defaultValue={initialData?.name ?? ""}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <DialogFooter className="gap-2 ">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-muted bg-transparent"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Save Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
