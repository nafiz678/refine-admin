import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CollectionForm } from "../collection-form";
import { AttachedProducts } from "../attached-products";
import { CollectionProp } from "../collections";

interface EditCollectionDialogProps {
  collection: CollectionProp;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    id: string,
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => void;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onUpdate,
}: EditCollectionDialogProps) {
  const handleSubmit = (
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => {
    onUpdate(collection.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update collection details and manage products
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              Details
            </TabsTrigger>
            <TabsTrigger value="products">
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="mt-6 space-y-4"
          >
            <CollectionForm
              initialData={collection}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <AttachedProducts
              collectionId={collection.id}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
