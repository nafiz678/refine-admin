import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CategoryAccordion } from "./category-accordion";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib";
import { Database } from "@/lib/supabase";
import { useCreate, useUpdate } from "@refinedev/core";
import { toast } from "sonner";
import { CategoryModal } from "./modal/category-modal";
import { Skeleton } from "@/components/ui/skeleton";

export type Category =
  Database["public"]["Tables"]["category"]["Row"];
export type SubCategory =
  Database["public"]["Tables"]["subCategory"]["Row"];

export type MergedCategory = Category & {
  subCategories: SubCategory[];
};

export type CategoryFormData = {
  name: string;
};

export type SubCategoryFormData = {
  categoryId?: string;
  name: string;
};

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const { mutate: createCategory } = useCreate({
    resource: "category",
  });
  const { mutate: updateCategory } = useUpdate({
    resource: "category",
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["Categories"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("category")
        .select("*");
      return data;
    },
  });

  const {
    data: subCategories,
    isLoading: isSubCategoriesLoading,
    refetch: refetchSubCategories,
  } = useQuery({
    queryKey: ["SubCategories"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("subCategory")
        .select("*");
      return data;
    },
  });

  const mergedCategories = (categories ?? []).map(
    (cat) => ({
      ...cat,
      subCategories: (subCategories ?? []).filter(
        (sub) => sub.categoryId === cat.id
      ),
    })
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleAddCategory = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory(
        {
          id: editingCategory.id,
          values: {
            name: data.name,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            refetchCategories();
            toast.success("Category updated " + data.name);
          },
        }
      );
    } else {
      createCategory(
        {
          values: {
            name: data.name,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            refetchCategories();
            toast.success("Category created");
          },
        }
      );
    }
  };

  if (isCategoriesLoading || isSubCategoriesLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 border rounded-md space-y-2"
          >
            {/* Category header */}
            <Skeleton className="h-6 w-1/3 rounded" />

            {/* Subcategories */}
            <div className="space-y-1 mt-2">
              {Array.from({
                length: 2,
              }).map((_, subIdx) => (
                <Skeleton
                  key={subIdx}
                  className="h-4 w-1/2 rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Categories
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your product categories and
                subcategories
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              New Category
            </Button>
          </div>
        </div>

        {/* Categories Accordion */}
        {mergedCategories.length > 0 ? (
          <CategoryAccordion
            categories={mergedCategories}
            refetchCategories={refetchCategories}
            refetchSubCategories={refetchSubCategories}
          />
        ) : (
          <p className="text-muted-foreground text-center mt-8">
            No categories found.
          </p>
        )}

        {/* Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddCategory}
        />
      </div>
    </main>
  );
};

export default Categories;
