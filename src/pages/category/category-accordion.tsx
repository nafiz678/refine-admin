import { useState } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Pen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { CategoryModal } from "./modal/category-modal";
import { SubCategoryModal } from "./modal/sub-category-modal";
import {
  Category,
  CategoryFormData,
  SubCategoryFormData,
} from "./category";
import { toast } from "sonner";
import {
  useCreate,
  useDelete,
  useUpdate,
} from "@refinedev/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QueryObserverResult } from "@tanstack/react-query";

type mergedCategories = {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  subCategories: {
    categoryId: string;
    createdAt: string;
    id: string;
    name: string;
    updatedAt: string;
  }[];
};

type RefetchType = () => Promise<QueryObserverResult>;

interface CategoryAccordionProps {
  categories: mergedCategories[];
  refetchCategories: RefetchType;
  refetchSubCategories: RefetchType;
}
type EditingSubCategory = {
  id: string;
  name: string;
} | null;

export function CategoryAccordion({
  categories,
  refetchCategories,
  refetchSubCategories,
}: CategoryAccordionProps) {
  const [expandedId, setExpandedId] = useState<
    string | null
  >(null);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >(undefined);
  const [isCategoryModalOpen, setIsCategoryModalOpen] =
    useState(false);

  const [subCategoryModalOpen, setSubCategoryModalOpen] =
    useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<
    string | null
  >(null);
  const [deleteSubCategoryInfo, setDeleteSubCategoryInfo] =
    useState<{
      categoryId: string;
      subCategoryId: string;
    } | null>(null);
  const [editingSubCategory, setEditingSubCategory] =
    useState<EditingSubCategory>(null);

  const { mutate: Create } = useCreate();
  const { mutate: Update } = useUpdate();

  const { mutate: deleteResource } = useDelete();

  // Update delete handlers to open the dialogs
  const handleDeleteCategory = (id: string) => {
    setDeleteCategoryId(id);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (data: CategoryFormData) => {
    if (editingCategory) {
      Update(
        {
          values: {
            name: data.name,
            updatedAt: new Date().toISOString(),
          },
          resource: "category",
          id: editingCategory.id,
        },
        {
          onSuccess: () => {
            toast.success("category updated " + data.name);
            refetchCategories();
          },
          onError: (error) =>
            toast.error(
              error.message || "Something went wrong"
            ),
        }
      );
      setEditingCategory(undefined);
    } else {
      Create(
        {
          resource: "category",
          values: { name: data.name },
        },
        {
          onSuccess: () =>
            toast.success("category created " + data.name),
          onError: (error) =>
            toast.error(
              error.message || "Something went wrong"
            ),
        }
      );
    }
    setIsCategoryModalOpen(false);
  };

  const handleAddOrEditSubCategory = (
    categoryId: string | null,
    data: SubCategoryFormData
  ) => {
    if (editingSubCategory) {
      Update(
        {
          id: editingSubCategory.id,
          resource: "subCategory",
          values: {
            name: data.name,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Subcategory updated");
            refetchSubCategories();
          },
          onError: (error) =>
            toast.error(
              error.message || "Something went wrong"
            ),
        }
      );

      setEditingSubCategory(null);
      setSubCategoryModalOpen(null);
      return;
    }

    Create(
      {
        resource: "subCategory",
        values: {
          name: data.name,
          categoryId,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Subcategory created");
          refetchSubCategories();
        },
        onError: (error) =>
          toast.error(
            error.message || "Something went wrong"
          ),
      }
    );

    setSubCategoryModalOpen(null);
  };

  const handleEditSubCategory = (sub: {
    id: string;
    name: string;
  }) => {
    setEditingSubCategory({
      id: sub.id,
      name: sub.name,
    });
    setSubCategoryModalOpen("edit");
  };

  const handleDeleteSubCategory = (
    categoryId: string,
    subCategoryId: string
  ) => {
    setDeleteSubCategoryInfo({ categoryId, subCategoryId });
  };

  const confirmDeleteCategory = () => {
    if (!deleteCategoryId) return;
    deleteResource(
      {
        id: deleteCategoryId,
        resource: "category",
      },
      {
        onSuccess: () => {
          toast.success("Successfully deleted category");
          refetchCategories();
        },
        onError: (error) =>
          toast.error(
            error.message || "Something went wrong"
          ),
      }
    );
    setDeleteCategoryId(null);
  };

  const confirmDeleteSubCategory = () => {
    if (!deleteSubCategoryInfo) return;
    deleteResource(
      {
        id: deleteSubCategoryInfo.subCategoryId,
        resource: "subCategory",
      },
      {
        onSuccess: () => {
          toast.success(
            "Successfully deleted sub-category"
          );
          refetchSubCategories();
        },
        onError: (error) =>
          toast.error(
            error.message || "Something went wrong"
          ),
      }
    );
    setDeleteSubCategoryInfo(null);
  };

  return (
    <>
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
            <p className="text-muted-foreground">
              No categories yet. Create your first one to
              get started.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card/80"
            >
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === category.id
                      ? null
                      : category.id
                  )
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {category.name}
                  </h3>
                </div>

                <div
                  className={cn(
                    "ml-3 shrink-0 text-muted-foreground transition-transform duration-300",
                    expandedId === category.id &&
                      "rotate-180"
                  )}
                >
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>

              {expandedId === category.id && (
                <div className="animate-in fade-in slide-in-from-top-2 border-t border-border/30 px-5 py-4 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pb-4 border-b border-border/20">
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Created
                      </p>
                      <p className="text-foreground">
                        {formatTime(category.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Last Updated
                      </p>
                      <p className="text-foreground">
                        {formatTime(category.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">
                        Subcategories
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSubCategoryModalOpen(
                            category.id
                          )
                        }
                        className="border-border hover:bg-primary/10 gap-1.5 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Subcategory
                      </Button>
                    </div>

                    {category.subCategories.length > 0 ? (
                      <div className="space-y-2">
                        {category.subCategories.map(
                          (sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background hover:border-border/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {sub.name}
                                </p>
                              </div>

                              <Button
                                variant={"ghost"}
                                size={"sm"}
                                onClick={() =>
                                  handleEditSubCategory(sub)
                                }
                                className="ml-2 p-1.5 rounded-lg transition-colors shrink-0"
                              >
                                <Pen className="h-4 w-4" />
                              </Button>

                              <Button
                                variant={"ghost"}
                                size={"sm"}
                                onClick={() =>
                                  handleDeleteSubCategory(
                                    category.id,
                                    sub.id
                                  )
                                }
                                className="ml-2 p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-2">
                        No subcategories yet
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border/20">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditCategory(category)
                      }
                      className="border-border hover:bg-primary/10 gap-1.5 flex-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDeleteCategory(category.id)
                      }
                      className="border-destructive/50 hover:bg-destructive/10 hover:text-destructive text-destructive gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
        title={
          editingCategory
            ? "Edit Category"
            : "Add New Category"
        }
      />

      {/* SubCategory Modal */}
      {subCategoryModalOpen && (
        <SubCategoryModal
          isOpen={true}
          onClose={() => {
            setSubCategoryModalOpen(null);
            setEditingSubCategory(null);
          }}
          onSave={(data) =>
            handleAddOrEditSubCategory(
              editingSubCategory
                ? null
                : subCategoryModalOpen,
              data
            )
          }
          initialData={
            editingSubCategory
              ? { name: editingSubCategory.name }
              : undefined
          }
          title={
            editingSubCategory
              ? "Edit Subcategory"
              : "Add Subcategory"
          }
        />
      )}

      {/* DELETE CATEGORY DIALOG */}
      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={confirmDeleteCategory}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE SUBCATEGORY DIALOG */}
      <AlertDialog
        open={!!deleteSubCategoryInfo}
        onOpenChange={() => setDeleteSubCategoryInfo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Subcategory
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this
              subcategory? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={confirmDeleteSubCategory}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
