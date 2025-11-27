import { UseFormReturn } from "react-hook-form";
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
import { ProductFormData } from "../../product-form";

interface ClassificationCardProps {
  form: UseFormReturn<ProductFormData>;
}

export function ClassificationCard({
  form,
}: ClassificationCardProps) {
  const { data: category } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("category")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
  const { data: subCategory } = useQuery({
    queryKey: ["subCategory"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("subCategory")
        .select("*");
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
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          Classification
        </CardTitle>
        <CardDescription>
          Categorize your product
        </CardDescription>
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
                    onValueChange={field.onChange}
                    value={field.value}
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
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Sub-Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategory?.map((sc) => (
                        <SelectItem
                          key={sc.id}
                          value={sc.id}
                        >
                          {sc.name}
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

        {/* Department + Collection */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "MENS",
                        "WOMENS",
                        "KIDS",
                        "UNISEX",
                        "COUPLE",
                      ].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
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
                        <SelectItem
                          key={cl.id}
                          value={cl.id}
                        >
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
