import { UseFormReturn, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseClient } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { ProductFormData } from "../product-form";
import { useEffect, useMemo, useRef } from "react";

interface ClassificationCardProps {
  form: UseFormReturn<ProductFormData>;
}

export function ClassificationCard({ form }: ClassificationCardProps) {
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  const selectedSubCategoryId = useWatch({
    control: form.control,
    name: "subCategoryId",
  });

  const previousCategoryRef = useRef<string | undefined>(undefined);

  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("category")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const {
    data: subCategory = [],
    isLoading: isSubCategoryLoading,
    isFetched: isSubCategoryFetched,
  } = useQuery({
    queryKey: ["subCategory", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];

      const { data, error } = await supabaseClient
        .from("subCategory")
        .select("id, name, categoryId")
        .eq("categoryId", selectedCategoryId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .schema("content")
        .from("collection")
        .select("id, title")
        .order("title", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const validSubCategoryIds = useMemo(() => {
    return new Set(subCategory.map((item) => item.id));
  }, [subCategory]);

  useEffect(() => {
    const previousCategoryId = previousCategoryRef.current;
    const categoryChanged =
      previousCategoryId !== undefined &&
      previousCategoryId !== selectedCategoryId;

    if (!selectedCategoryId) {
      if (selectedSubCategoryId) {
        form.setValue("subCategoryId", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      previousCategoryRef.current = selectedCategoryId;
      return;
    }

    if (!isSubCategoryFetched || isSubCategoryLoading) {
      previousCategoryRef.current = selectedCategoryId;
      return;
    }

    if (
      selectedSubCategoryId &&
      !validSubCategoryIds.has(selectedSubCategoryId)
    ) {
      form.setValue("subCategoryId", "", {
        shouldDirty: categoryChanged,
        shouldValidate: true,
      });
    }

    previousCategoryRef.current = selectedCategoryId;
  }, [
    selectedCategoryId,
    selectedSubCategoryId,
    validSubCategoryIds,
    isSubCategoryFetched,
    isSubCategoryLoading,
    form,
  ]);

  const isSubCategoryDisabled = !selectedCategoryId || isSubCategoryLoading;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Classification</CardTitle>
        <CardDescription>Categorize your product</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);

                      if (value !== selectedCategoryId) {
                        form.setValue("subCategoryId", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    disabled={isCategoryLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {category?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sub Category */}
          <FormField
            control={form.control}
            name="subCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isSubCategoryDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedCategoryId
                            ? "Select a category first"
                            : isSubCategoryLoading
                              ? "Loading sub-categories..."
                              : "Select a Sub-Category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategory.length > 0 ? (
                        subCategory.map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            {sc.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__empty" disabled>
                          No sub-categories found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Department + Collection */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {["MENS", "WOMENS", "KIDS", "UNISEX", "COUPLE"].map(
                        (d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections?.map((cl) => (
                        <SelectItem key={cl.id} value={cl.id}>
                          {cl.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
