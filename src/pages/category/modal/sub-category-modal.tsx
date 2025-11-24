import type React from "react";
import { useState } from "react";
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
import { SubCategoryFormData } from "../category";
import { toast } from "sonner";

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubCategoryFormData) => void;
  initialData?: SubCategoryFormData;
  title?: string;
}

export function SubCategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Add SubCategory",
}: SubCategoryModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    onSave({ name });
  };

  return (
    <Dialog key={isOpen ? "open" : "closed"} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sub-name">
              Subcategory Name *
            </Label>
            <Input
              id="sub-name"
              autoFocus
              placeholder="e.g., Phones, Laptops"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData
                ? "Save Changes"
                : "Add Subcategory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
