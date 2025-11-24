import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ProductProp } from "./edit-products";
import ImageUploader from "@/components/image-uploader";
import { supabaseClient } from "@/lib";
import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdate } from "@refinedev/core";

type EditProductFormProps = {
  product: ProductProp;
  isLoading?: boolean;
};

export function EditProductForm({
  product,
  isLoading = false,
}: EditProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    sku: product?.sku || "",
    images: product?.images || [],
    material: product?.material || "",
    categoryId: product?.categoryId || "",
    subCategoryId: product?.subCategoryId || "",
    department: product?.department || "",
  });

  const [preview, setPreview] = useState<string[]>(
    product?.images || []
  );
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();
  const { mutate: updateProduct } = useUpdate();
  const navigate = useNavigate();

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

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    const updatedImages = [...formData.images, ...urls];
    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
    setPreview(updatedImages);
  };

  const removeImage = (index: number) => {
    const newImages = preview.filter((_, i) => i !== index);
    setPreview(newImages);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      updateProduct(
        {
          id: product.id,
          resource: "product",
          values: {
            ...formData,
            updatedAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Product created successfully!");
            navigate("/products");
          },
          onError: () => {
            toast.error(`Failed to create product.`);
          },
        }
      );
      console.log(formData.images)
    } catch (err) {
      toast.error(`Save failed! ${err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="lg" asChild>
            <Link
              to={"/products"}
              className="flex items-center gap-2 px-10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="pr-4">
            <h1 className="lg:text-4xl md:text-3xl text-lg font-bold text-foreground mb-2">
              Edit Product
            </h1>
            <p className="text-muted-foreground lg:text-base text-xs">
              Update product information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between md:flex-row flex-col">
              <CardTitle className="lg:text-2xl text-xl font-bold pt-3">
                Product Details
              </CardTitle>
              <div>
                {product?.id && (
                  <Badge className="bg-primary-foreground whitespace-break-spaces text-primary font-semibold px-3 py-1">
                    Title: {product.title}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-semibold"
                    >
                      Product Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Premium Wireless Headphones"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange(
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* SKU */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="sku"
                      className="text-sm font-semibold"
                    >
                      SKU
                    </Label>
                    <Input
                      id="sku"
                      placeholder="e.g., PROD-WH-2024-001"
                      value={formData.sku}
                      onChange={(e) =>
                        handleInputChange(
                          "sku",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Material */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="material"
                      className="text-sm font-semibold"
                    >
                      Material
                    </Label>
                    <Input
                      id="material"
                      placeholder="e.g., Microfiber, PU Coated Fabric"
                      value={formData.material}
                      onChange={(e) =>
                        handleInputChange(
                          "material",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-sm font-semibold"
                    >
                      Department
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(val) =>
                        handleInputChange("department", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MENS">
                          MENS
                        </SelectItem>
                        <SelectItem value="WOMENS">
                          WOMENS
                        </SelectItem>
                        <SelectItem value="KIDS">
                          KIDS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-semibold"
                    >
                      Category
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val) =>
                        handleInputChange("categoryId", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {category &&
                          category.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.id}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub-category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="subCategory"
                      className="text-sm font-semibold"
                    >
                      Sub-category
                    </Label>
                    <Select
                      value={formData.subCategoryId}
                      onValueChange={(val) =>
                        handleInputChange(
                          "subCategoryId",
                          val
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategory &&
                          subCategory.map((sub) => (
                            <SelectItem
                              key={sub.id}
                              value={sub.id}
                            >
                              {sub.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-foreground"
                >
                  Description
                </Label>
                <Editor
                  key={theme}
                  apiKey={import.meta.env.VITE_TINYMCE_KEY}
                  value={formData.description}
                  onEditorChange={handleDescriptionChange}
                  initialValue="Write a detailed product description… Highlight features, materials, sizing, care instructions, and benefits."
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
                      theme === "dark" ? "dark" : "default",
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
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Product Images
                </h3>
                <ImageUploader
                  onUploadComplete={handleImagesUploaded}
                />
                {preview.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        Images ({preview.length})
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreview([]);
                          setFormData((prev) => ({
                            ...prev,
                            images: [],
                          }));
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {preview.map((image, index) => {
                        const { data } =
                          supabaseClient.storage
                            .from("product")
                            .getPublicUrl(image);
                        const imageUrl = data.publicUrl;
                        return (
                          <div
                            key={index}
                            className="group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                          >
                            <div className="relative h-32 w-full bg-secondary">
                              <img
                                src={
                                  imageUrl ||
                                  "/placeholder.svg"
                                }
                                alt={`Product ${index + 1}`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeImage(index)
                              }
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <Badge className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              #{index + 1}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-8 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    navigate("/products");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || submitting}
                  className="gap-2 h-10 px-6 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
