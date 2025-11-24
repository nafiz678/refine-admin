import { CreateCollectionDialog } from "./dialog/create-collection-dialog";
import { CollectionsList } from "./collections-list";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib";
import { Database } from "@/lib/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type CollectionProp =
  Database["content"]["Tables"]["collection"]["Row"];

export interface Product {
  id: string;
  title: string;
  image?: string;
  category?: string;
  price: number;
}

export interface CollectionProduct {
  collectionId: string;
  productId: string;
}

export default function Collections() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    refetch: refetchCollection,
  } = useQuery({
    queryKey: ["collections", searchQuery],
    queryFn: async () => {
      const { data } = await supabaseClient
        .schema("content")
        .from("collection")
        .select("*")
        .ilike("title", `%${searchQuery}%`);
      return data;
    },
  });
  const collections = data ?? [];

  const handleCreateCollection = async (
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => {
    const newCollection: CollectionProp = {
      id: Date.now().toString(36),
      title: data.title,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: "",
    };

    try {
      const { error } = await supabaseClient
        .schema("content")
        .from("collection")
        .insert(newCollection);
      if (error) {
        toast.error(`Failed to create collection`);
        return;
      }

      toast.success(`Collection created successfully`);
      refetchCollection();
    } catch (error) {
      toast.error(`Something went wrong ${error}`);
    }
  };

  const handleUpdateCollection = async (
    id: string,
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    >
  ) => {
    try {
      const { error } = await supabaseClient
        .schema("content")
        .from("collection")
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        toast.error(
          `Failed to update collection: ${error.message}`
        );
        return;
      }

      toast.success("Collection updated successfully");
      refetchCollection();
    } catch (err) {
      toast.error(`Something went wrong: ${err}`);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .schema("content")
        .from("collection")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error(
          `Failed to delete collection: ${error.message}`
        );
        return;
      }

      toast.success("Collection deleted successfully");
      refetchCollection();
    } catch (err) {
      toast.error(`Something went wrong: ${err}`);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Collections
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your product collections
              </p>
            </div>
            <CreateCollectionDialog
              onCreate={handleCreateCollection}
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-6 py-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") refetchCollection();
              }}
              className="pl-10"
            />
          </div>
          <CollectionsList
            collections={collections}
            onUpdate={handleUpdateCollection}
            onDelete={handleDeleteCollection}
          />
        </div>
      </div>
    </main>
  );
}

function Loader() {
  const rows = Array.from({ length: 5 });
  return (
    <div className="space-y-6">
      {/* Search Skeleton */}
      <div className="relative">
        <Skeleton className="h-16 w-full rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">
                <Skeleton className="h-6 w-24 rounded" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-6 w-32 rounded" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-6 w-20 rounded" />
              </TableHead>
              <TableHead className="font-semibold">
                <Skeleton className="h-6 w-20 rounded" />
              </TableHead>
              <TableHead className="text-right font-semibold">
                <Skeleton className="h-6 w-12 rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((_, index) => (
              <TableRow
                key={index}
                className="animate-pulse"
              >
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-32 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-6 w-12 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
