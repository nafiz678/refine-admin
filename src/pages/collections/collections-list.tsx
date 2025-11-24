import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollectionRow } from "./collection-row";
import { CollectionProp } from "./collections";

interface CollectionsListProps {
  collections: CollectionProp[];
  onUpdate: (
    id: string,
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => void;
  onDelete: (id: string) => void;
}

export function CollectionsList({
  collections,
  onUpdate,
  onDelete,
}: CollectionsListProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg font-medium text-foreground">
          No collections yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first collection to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">
                Title
              </TableHead>
              <TableHead className="font-semibold">
                Description
              </TableHead>
              <TableHead className="font-semibold">
                Created
              </TableHead>
              <TableHead className="font-semibold">
                Updated
              </TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
