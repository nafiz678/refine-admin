import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditCollectionDialog } from "./dialog/edit-collection-dialog";
import { DeleteCollectionDialog } from "./dialog/delete-collection-dialog";
import { CollectionProp } from "./collections";
import { formatTime } from "@/lib/utils";

interface CollectionRowProps {
  collection: CollectionProp;
  onUpdate: (
    id: string,
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => void;
  onDelete: (id: string) => void;
}

export function CollectionRow({
  collection,
  onUpdate,
  onDelete,
}: CollectionRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <TableRow className="hover:bg-muted/30 transition-colors">
        <TableCell className="font-medium text-foreground">
          <div className="flex items-center gap-2">
            {collection.thumbnail && (
              <img
                src={`${
                  import.meta.env.VITE_SUPABASE_URL
                }/storage/v1/object/public/${
                  collection.thumbnail
                }`}
                alt={collection.title}
                className="h-8 w-8 rounded object-cover"
              />
            )}
            <span>{collection.title}</span>
          </div>
        </TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground">
          {collection.description || "—"}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatTime(collection.createdAt)}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatTime(collection.updatedAt)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <EditCollectionDialog
        collection={collection}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdate={onUpdate}
      />

      <DeleteCollectionDialog
        collection={collection}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={onDelete}
      />
    </>
  );
}
