import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/use-fetch-products";

interface ProductSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProducts: (productIds: string[]) => void;
  excludeProductIds?: string[];
}

export function ProductSearchModal({
  open,
  onOpenChange,
  onAddProducts,
  excludeProductIds = [],
}: ProductSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    []
  );
  const { data: products } = useProducts();

  const filteredProducts = (products || []).filter(
    (product) =>
      !excludeProductIds.includes(product.id) &&
      (product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        product.categoryId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const handleToggle = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddSelected = () => {
    onAddProducts(selectedIds);
    setSelectedIds([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Products to Collection
          </DialogTitle>
          <DialogDescription>
            Search and select products to add to this
            collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              autoFocus
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <ScrollArea className="h-80 rounded-lg border border-border bg-muted/20 p-4">
            {filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-4 rounded-lg border border-border bg-background p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleToggle(product.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(
                        product.id
                      )}
                      onCheckedChange={() =>
                        handleToggle(product.id)
                      }
                      className="mt-1"
                    />

                    {/* Product Image */}
                    <img
                      src={`${
                        import.meta.env.VITE_SUPABASE_URL
                      }/storage/v1/object/public/${
                        product.images?.[0]
                      }`}
                      alt={product.title}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/fallback.jpg";
                      }}
                      className="h-16 w-16 rounded-md border border-border object-cover"
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-2">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.department}
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {new Date(
                          product.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No products found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Selected Count */}
          <div className="text-sm text-muted-foreground">
            {selectedIds.length > 0 ? (
              <span>
                {selectedIds.length} product(s) selected
              </span>
            ) : (
              <span>No products selected</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedIds.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add{" "}
              {selectedIds.length > 0
                ? `${selectedIds.length} `
                : ""}
              Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
