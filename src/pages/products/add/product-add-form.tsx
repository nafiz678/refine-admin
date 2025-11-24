import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeywordsField } from "./keywords-field";
import { ThumbnailUploadField } from "./thumnail-upload";
import { MultipleImageUploadField } from "./multiple-image-upload";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib";
import { useCreate, useGetIdentity } from "@refinedev/core";
import { toast } from "sonner";
import {
  // uploadImages,
  uploadThumbnail,
} from "../upload-image";

const productSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters"),
  department: z.enum([
    "MENS",
    "WOMENS",
    "KIDS",
    "UNISEX",
    "COUPLE",
  ]),
  material: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  collectionId: z.string().optional(),
  authorId: z.string().optional(),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductAddForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const { data: identity } = useGetIdentity();
  const navigate = useNavigate();
  const { mutate: createProduct } = useCreate();

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

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      sku: "",
      department: "UNISEX",
      material: "",
      categoryId: "",
      subCategoryId: "",
      collectionId: "",
      authorId: "",
      thumbnail: "",
      images: [],
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      updatedAt: "",
    },
  });

  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const thumbnailUrl = await uploadThumbnail(
        values.thumbnail || ""
      );
      
      console.log(thumbnailUrl)
      
      const finalData = {
        ...values,
        updatedAt: new Date().toISOString(),
        collectionId: values.collectionId || null,
        authorId: identity.id,
        // images: imagesUrls,
      };
      
      createProduct(
        {
          values: finalData,
          resource: "product",
        },
        {
          onSuccess: () => {
            toast.success("Product created successfully!");
            form.reset();
            navigate("/products");
          },
          onError: () => {
            toast.error(`Failed to create product.`);
          },
        }
      );
    } catch (err) {
      toast.error(`Something went wrong! ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="lg:text-3xl md:text-2xl text-lg font-semibold tracking-tight">
            Add New Product
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the product details below to create a
            new product.
          </p>
        </div>

        <Button variant="ghost" size="lg" asChild>
          <Link
            to="/products"
            className="flex items-center gap-2 px-10"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* BASIC INFORMATION */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential product details
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Product Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Premium Leather Jacket"
                        {...field}
                        className="border-border/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU + MATERIAL */}
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., SKU-001"
                          {...field}
                          className="border-border/50 font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Stock Keeping Unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Genuine Leather"
                          {...field}
                          className="border-border/50"
                        />
                      </FormControl>
                      <FormDescription>
                        Material Used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TinyMCE Editor — PERFECTLY INTEGRATED */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Editor
                        key={theme}
                        apiKey={
                          import.meta.env.VITE_TINYMCE_KEY
                        }
                        initialValue="Write a detailed product description… Highlight features, materials, sizing, care instructions, and benefits."
                        value={field.value}
                        onEditorChange={field.onChange}
                        init={{
                          height: 500,
                          menubar: false,
                          toolbar:
                            "undo redo | blocks | bold italic forecolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | removeformat",
                          skin:
                            theme === "dark"
                              ? "oxide-dark"
                              : "oxide",
                          content_css:
                            theme === "dark"
                              ? "dark"
                              : "default",
                          statusbar: false,
                          plugins: [
                            "lists",
                            "link",
                            "autolink",
                            "wordcount",
                            "searchreplace",
                          ],
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* CLASSIFICATION */}
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
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {category &&
                              category.map((c) => (
                                <SelectItem
                                  key={c.id}
                                  value={c.id}
                                >
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
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Sub-Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {subCategory &&
                              subCategory.map((sc) => (
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

              {/* Department */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
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
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {collections &&
                              collections.map((cl) => (
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

          {/* MEDIA */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                Media
              </CardTitle>
              <CardDescription>
                Product images and thumbnails
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <ThumbnailUploadField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended size: 400x400px — Max 5MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Images */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MultipleImageUploadField
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload up to 5 images (JPG/PNG — Max
                      5MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">SEO</CardTitle>
              <CardDescription>
                Search engine optimization details
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* SEO Title */}
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="50-60 characters"
                        maxLength={60}
                        {...field}
                        className="border-border/50"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/60
                      characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEO Description */}
              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="150–160 characters"
                        maxLength={160}
                        {...field}
                        className="resize-none border-border/50"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/160
                      characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SEO Keywords */}
              <FormField
                control={form.control}
                name="seoKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Keywords</FormLabel>
                    <FormControl>
                      <KeywordsField
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Add keywords separated by Enter or
                      comma
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              className="border-border/50 cursor-pointer"
              onClick={() => {
                navigate("/products");
              }}
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    Publishing...
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  "Publish Product"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
