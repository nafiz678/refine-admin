import { useParams } from "react-router";
import { useOne } from "@refinedev/core";
import { Database } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditProductForm } from "./edit-product-form";

export type ProductProp =
  Database["public"]["Tables"]["product"]["Row"];

const EditProduct = () => {
  const { id } = useParams();

  const {
    query: { data, isLoading },
  } = useOne<ProductProp>({
    resource: "product",
    id: id,
  });

  const product = data?.data;

  if (isLoading || !product) {
    return <Loader />;
  }


  return (
    <EditProductForm
      product={product}
      isLoading={isLoading}
    />
  );
};

export default EditProduct;

function Loader() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-28 rounded-md" />
          <div className="space-y-2 text-right">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold pt-3">
                <Skeleton className="h-6 w-40" />
              </CardTitle>
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-10">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>

            {/* Availability Section */}
            <div className="space-y-3 bg-secondary/30 dark:bg-secondary/10 rounded-lg p-4">
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-32 w-full rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-8 border-t border-border">
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
