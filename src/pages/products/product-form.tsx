import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import { toast } from "sonner";
import { productSchema, VariantFormData } from "@/lib/type";
import { BasicInfoCard } from "./add/form-element/basic-card-info";
import { ClassificationCard } from "./add/form-element/classification-card";
import { MediaCard } from "./add/form-element/media-card";
import { VariantsCard } from "./add/form-element/variants-card";
import { SEOCard } from "./add/form-element/seo-card";
import {
  uploadImages,
  uploadThumbnail,
  uploadVariantImage,
} from "./upload-image";
import { supabaseClient } from "@/lib";
import { ProductProp } from "./edit/edit-products";

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductForm {
  existingProduct?: ProductProp;
}

export function ProductForm({
  existingProduct,
}: ProductForm) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantFields, setVariantFields] = useState<
    VariantFormData[]
  >([]);
  const editingMode: boolean = !!existingProduct;
  const { data: identity } = useGetIdentity();
  const navigate = useNavigate();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: existingProduct?.title ?? "",
      description: existingProduct?.description ?? "",
      sku: existingProduct?.sku ?? "",
      department: existingProduct?.department ?? "UNISEX",
      material: existingProduct?.material ?? "",
      categoryId: existingProduct?.categoryId ?? "",
      subCategoryId: existingProduct?.subCategoryId ?? "",
      collectionId: existingProduct?.collectionId ?? "",
      authorId: existingProduct?.authorId ?? "",
      thumbnail: existingProduct?.thumbnail ?? "",
      images: existingProduct?.images ?? [],
      seoTitle: existingProduct?.seoTitle ?? "",
      seoDescription: existingProduct?.seoDescription ?? "",
      seoKeywords: existingProduct?.seoKeywords ?? [],
      updatedAt: existingProduct?.updatedAt ?? "",
    },
  });

  const onSubmit = async (values: ProductFormData) => {
    if (!identity)
      return toast.error("User not authenticated");
    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      // Upload thumbnail
      let finalThumbnail = existingProduct?.thumbnail ?? "";
      if (
        values.thumbnail instanceof File ||
        values.thumbnail instanceof Blob
      ) {
        const uploadedThumbnail = await uploadThumbnail(
          values.thumbnail
        );
        finalThumbnail = `product/${uploadedThumbnail}`;
      }

      // Upload new images
      const uploadedImages: string[] = [];
      const existingImages =
        (values.images?.filter(
          (img) => typeof img === "string"
        ) as string[]) ?? [];
      const newFiles =
        (values.images?.filter(
          (img) => img instanceof File
        ) as File[]) ?? [];

      if (newFiles.length > 0) {
        const newUploads = await uploadImages(newFiles);
        uploadedImages.push(
          ...newUploads.map((f) => `product/${f}`)
        );
      }

      const finalImages = [
        ...existingImages,
        ...uploadedImages,
      ];

      // Insert or update product
      const productData = {
        ...values,
        thumbnail: finalThumbnail,
        images: finalImages,
        updatedAt: timestamp,
        authorId: existingProduct
          ? existingProduct.authorId
          : identity.id,
      };

      let productId: string;

      if (!existingProduct) {
        const { data: newProduct, error } =
          await supabaseClient
            .from("product")
            .insert(productData)
            .select()
            .single();
        if (error || !newProduct)
          throw (
            error ?? new Error("Failed to create product")
          );
        productId = newProduct.id;
      } else {
        const { error } = await supabaseClient
          .from("product")
          .update(productData)
          .eq("id", existingProduct.id);
        if (error) throw error;
        productId = existingProduct.id;
      }

      // Handle variants
      // Fetch existing variants if editing
      const existingVariants = existingProduct
        ? (
            await supabaseClient
              .from("productVariant")
              .select("*")
              .eq("productId", productId)
          ).data ?? []
        : [];

      const existingVariantIds = existingVariants.map(
        (v) => v.id
      );
      const updatedVariantIds = variantFields
        .filter((v) => v.id)
        .map((v) => v.id!);

      // Delete removed variants
      const toDelete = existingVariantIds.filter(
        (id) => !updatedVariantIds.includes(id)
      );
      if (toDelete.length > 0) {
        const { error } = await supabaseClient
          .from("productVariant")
          .delete()
          .in("id", toDelete);
        if (error) throw error;
      }

      // Insert or update variants
      if (variantFields.length > 0) {
        const variantPromises = variantFields.map(
          async (variant) => {
            const imageUrl =
              variant.image instanceof File
                ? await uploadVariantImage(variant.image)
                : variant.image;

            const finalVariant = {
              ...variant,
              productId,
              image: imageUrl
                ? `product/${imageUrl}`
                : undefined,
              updatedAt: timestamp,
            };

            if (
              existingVariants.find(
                (v) => v.id === variant.id
              )
            ) {
              // Update existing variant
              const { data, error } = await supabaseClient
                .from("productVariant")
                .update(finalVariant)
                .eq("id", variant.id);
              if (error) throw error;
              console.log("Updating variant", data);
            } else {
              // Insert new variant
              const { data, error } = await supabaseClient
                .from("productVariant")
                .insert({
                  ...finalVariant,
                  createdAt: timestamp,
                });
              if (error) throw error;
              console.log("Inserting variant", data);
            }
          }
        );
        await Promise.all(variantPromises);
      }

      toast.success(
        existingProduct
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
      form.reset();
      setVariantFields([]);
      navigate("/products");
    } catch (err) {
      toast.error(
        `Something went wrong: ${
          err instanceof Error
            ? err.message
            : JSON.stringify(err)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return existingProduct ? (
    <div className="flex items-center justify-center">
      Fixing some ui changes
    </div>
  ) : (
    <div className="mx-auto max-w-6xl w-full px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="lg:text-3xl md:text-2xl text-lg font-semibold tracking-tight">
            {editingMode
              ? "Edit Product"
              : "Add New Product"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the product details below to{" "}
            {editingMode ? "modify the" : "create a new"}{" "}
            product.
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
          <BasicInfoCard form={form} />

          {/* CLASSIFICATION */}
          <ClassificationCard form={form} />

          {/* MEDIA */}
          <MediaCard form={form} />

          {/* VARIANTS CARD */}
          <VariantsCard
            setVariantFields={setVariantFields}
            variantFields={variantFields}
          />

          {/* SEO */}
          <SEOCard form={form} />

          {/* Submit Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              className="border-border/50 cursor-pointer"
              disabled={isSubmitting}
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
                className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer disabled:opacity-35"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    {editingMode
                      ? "Updating..."
                      : "Publishing..."}
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : editingMode ? (
                  "Update Product"
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
