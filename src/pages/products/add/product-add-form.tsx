import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCreate, useGetIdentity } from "@refinedev/core";
import { toast } from "sonner";
import { productSchema, VariantFormData } from "@/lib/type";
import { BasicInfoCard } from "./form-element/basic-card-info";
import { ClassificationCard } from "./form-element/classification-card";
import { MediaCard } from "./form-element/media-card";
import { VariantsCard } from "./form-element/variants-card";
import { SEOCard } from "./form-element/seo-card";
import {
  uploadImages,
  uploadThumbnail,
  uploadVariantImage,
} from "../upload-image";
import { supabaseClient } from "@/lib";

export type ProductFormData = z.infer<typeof productSchema>;

export function ProductAddForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: identity } = useGetIdentity();
  const navigate = useNavigate();
  const { mutate: createProduct } = useCreate();

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

  const [variantFields, setVariantFields] = useState<
    VariantFormData[]
  >([]);

  const onSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (!identity) {
        throw new Error("User not authenticated");
      }

      // 1. Upload main thumbnail
      const thumbnailUrl = values.thumbnail
        ? await uploadThumbnail(values.thumbnail)
        : undefined;

      // 2. Upload product images in parallel
      const uploadedImagePaths = values.images?.length
        ? await uploadImages(values.images as string[])
        : [];

      const imageUrls = uploadedImagePaths.map(
        (path) => `product/${path}`
      );

      const finalThumbnail = values.thumbnail ? `product/${thumbnailUrl}`: imageUrls[0];

      // 3. Prepare product data
      const finalData = {
        ...values,
        authorId: identity.id,
        thumbnail: finalThumbnail,
        images: imageUrls,
        updatedAt: new Date().toISOString(),
      };
      console.log(finalData);

      createProduct(
        {
          values: finalData,
          resource: "product",
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: async (productCreated: any) => {
            const productId = productCreated.data.id;

            if (variantFields.length > 0) {
              // 5. Upload variant images in parallel
              const variantPromises = variantFields.map(
                async (variant) => {
                  const variantImageUrl = variant.image
                    ? await uploadVariantImage(
                        variant.image
                      )
                    : undefined;

                  const finalVariant = {
                    ...variant,
                    productId,
                    image: `product/${variantImageUrl}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  const { error } = await supabaseClient
                    .from("productVariant")
                    .insert(finalVariant);

                  if (error) throw error;
                }
              );

              await Promise.all(variantPromises);
            }

            toast.success(
              "Product and variants created successfully!"
            );
            form.reset();
            setVariantFields([]);
            navigate("/products");
          },
          onError: () => {
            toast.error("Failed to create product.");
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
