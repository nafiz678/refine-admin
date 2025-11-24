import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { ProductSearchModal } from "./dialog/product-search-modal";
import { useProducts } from "@/hooks/use-fetch-products";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabaseClient } from "@/lib";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Prop = {
  collectionId: string;
};

export function AttachedProducts({ collectionId }: Prop) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProducts();

  const attachedProducts = (products || []).filter(
    (p) => p.collectionId === collectionId
  );

  console.log(attachedProducts);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load products.
      </div>
    );
  }

  const handleAddProducts = async (
    productIds: string[]
  ) => {
    const { error } = await supabaseClient
      .from("product")
      .update({ collectionId: collectionId })
      .in("id", productIds);

    if (error) {
      toast.error(
        `Failed to add products ${error.message}`
      );
      return;
    }

    toast.success(`Products added to collection`);
    refetch();
    setIsSearchOpen(false);
  };

  const handleRemoveProduct = async (productId: string) => {
    const { error } = await supabaseClient
      .from("product")
      .update({ collectionId: null })
      .eq("id", productId);

    if (error) {
      toast.error(
        `Failed to delete products ${error.message}`
      );
      return;
    }

    toast.success("Product removed");
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Attached Products
          </h3>
          <p className="text-xs text-muted-foreground">
            {attachedProducts.length} products in this
            collection
          </p>
        </div>
        <Button
          onClick={() => setIsSearchOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Products
        </Button>
      </div>

      {attachedProducts.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attachedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    {product.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.department}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${product.meta?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">
                            Remove
                          </span>
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove product?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This product will be removed
                            from this collection. You can
                            add it again later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleRemoveProduct(
                                product.id
                              )
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No products added yet
          </p>
        </div>
      )}

      <ProductSearchModal
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onAddProducts={handleAddProducts}
        excludeProductIds={attachedProducts.map(
          (p) => p.id
        )}
      />
    </div>
  );
}

function Loader() {
  const skeletonRows = Array.from({ length: 2 });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/40">
            <tr>
              <th>
                <Skeleton className="h-6 w-24" />
              </th>
              <th>
                <Skeleton className="h-6 w-24" />
              </th>
              <th>
                <Skeleton className="h-6 w-16" />
              </th>
              <th className="text-right">
                <Skeleton className="h-6 w-10" />
              </th>
            </tr>
          </thead>
          <tbody>
            {skeletonRows.map((_, i) => (
              <tr
                key={i}
                className="border-t border-border"
              >
                <td>
                  <Skeleton className="h-4 w-32 my-2" />
                </td>
                <td>
                  <Skeleton className="h-3 w-20 my-2" />
                </td>
                <td>
                  <Skeleton className="h-4 w-16 my-2" />
                </td>
                <td className="text-right">
                  <Skeleton className="h-8 w-8 my-2 rounded-full mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
