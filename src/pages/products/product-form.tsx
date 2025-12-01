import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import { toast } from "sonner";
import {
  DBVariantFormData,
  productSchema,
} from "@/lib/type";
import {
  uploadImages,
  uploadThumbnail,
  uploadVariantImage,
} from "./upload-image";
import { supabaseClient } from "@/lib";
import { ProductProp } from "./edit/edit-products";
import { BasicInfoCard } from "./form-element/basic-card-info";
import { ClassificationCard } from "./form-element/classification-card";
import { MediaCard } from "./form-element/media-card";
import {
  ColorGroup,
  VariantsCard,
} from "./form-element/variants-card";
import { SEOCard } from "./form-element/seo-card";
import { useQuery } from "@tanstack/react-query";

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductForm {
  existingProduct?: ProductProp;
}

export function ProductForm({
  existingProduct,
}: ProductForm) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantFields, setVariantFields] = useState<
    ColorGroup[]
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

  const {
    data: existingVariants,
    refetch: existingRefetch,
  } = useQuery({
    queryKey: ["variants", existingProduct?.id],
    queryFn: async () => {
      if (!existingProduct?.id) return [];
      const { data } = await supabaseClient
        .from("productVariant")
        .select("*")
        .eq("productId", existingProduct.id);
      return data || [];
    },
    enabled: !!existingProduct?.id,
  });

  useEffect(() => {
    if (!existingVariants) return;

    const grouped: Record<string, ColorGroup> = {};

    existingVariants.forEach((v) => {
      if (!grouped[v.color]) {
        grouped[v.color] = {
          colorName: v.color,
          image: v.image ?? undefined,
          sizes: [],
          id: v.id,
        };
      }

      grouped[v.color].sizes.push({
        size: v.size,
        stockQty: v.stockQty,
        price: v.price,
        discountPrice: v.discountPrice ?? null,
        status: v.status,
        expiresAt: v.expiresAt?.split("T")[0] ?? undefined,
        id: v.id,
      });
    });

    setVariantFields(Object.values(grouped));
  }, [existingVariants]);

  const onSubmit = async (values: ProductFormData) => {
    if (!identity)
      return toast.error("User not authenticated");
    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      let productId = existingProduct?.id ?? "";
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

      // Upload images
      const existingImages = values.images?.filter(
        (i) => typeof i === "string"
      ) as string[];
      const newFiles = values.images?.filter(
        (i) => i instanceof File
      ) as File[];
      const uploadedImages =
        newFiles.length > 0
          ? await uploadImages(newFiles)
          : [];
      const finalImages = [
        ...existingImages,
        ...uploadedImages.map((f) => `product/${f}`),
      ];

      // Upsert product
      const productData = {
        ...values,
        thumbnail: finalThumbnail,
        images: finalImages,
        updatedAt: timestamp,
        authorId: existingProduct?.authorId ?? identity.id,
      };
      console.log(productData);

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

      // Build DB variants array
      const dbVariantsNested = await Promise.all(
        variantFields.map((v) =>
          mapVariantForDB(v, productId, timestamp)
        )
      );
      const dbVariants = dbVariantsNested.flat();

      // If no variants to save, dbVariants might be []
      console.log("dbVariants", dbVariants);

      const updatedVariantIds = dbVariants.map((v) => v.id);

      // Fetch existing variant IDs once (only if editing)
      let existingVariantIds: string[] = [];
      if (editingMode) {
        existingVariantIds = (existingVariants ?? [])
          .map((v) => v.id)
          .filter(Boolean) as string[];
      }

      // Perform bulk upsert for all variants (on id)
      if (dbVariants.length > 0) {
        // supabase upsert will insert new rows and update existing based on id
        const { data: upsert, error: upsertError } =
          await supabaseClient
            .from("productVariant")
            .upsert(dbVariants, { onConflict: "id" });

        if (upsertError) throw upsertError;
        console.log(upsert)
      }

      // Delete old variants that no longer exist in the updated set
      if (editingMode && existingVariantIds.length > 0) {
        // which existing IDs are NOT present in the updated set?
        const toDelete = existingVariantIds.filter(
          (id) => !updatedVariantIds.includes(id)
        );

        if (toDelete.length > 0) {
          const { error: deleteError } =
            await supabaseClient
              .from("productVariant")
              .delete()
              .in("id", toDelete);

          if (deleteError) throw deleteError;
        }
      }

      toast.success(
        editingMode
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
      form.reset();
      setVariantFields([]);
      existingRefetch();
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

  return (
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
            onChange={setVariantFields}
            value={variantFields}
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

async function mapVariantForDB(
  variant: ColorGroup,
  productId: string,
  timestamp: string
): Promise<DBVariantFormData[]> {
  let imageUrl: string | null = null;

  if (variant.image instanceof File) {
    try {
      const uploadedPath = await uploadVariantImage(
        variant.image
      );
      imageUrl = `product/${uploadedPath}`;
    } catch (err) {
      toast.error("Variant image upload failed:" + err);
      toast.error(
        `Failed to upload image for color ${variant.colorName}`
      );
    }
  } else if (
    typeof variant.image === "string" &&
    variant.image.length > 0
  ) {
    imageUrl = variant.image;
  }

  // Create DB entries
  return variant.sizes.map((s) => {
    const sizeId = s.id ?? crypto.randomUUID(); // generate if missing
    return {
      id: sizeId,
      productId,
      color: variant.colorName,
      size: s.size,
      stockQty: Number(s.stockQty),
      price: Number(s.price),
      discountPrice:
        s.discountPrice === null ||
        s.discountPrice === "" ||
        s.discountPrice === undefined
          ? null
          : Number(s.discountPrice),
      status: s.status,
      expiresAt: s.expiresAt
        ? `${s.expiresAt} 00:00:00`
        : null,
      image: imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as DBVariantFormData;
  });
}
