import z from "zod";
import { Database } from "./supabase";

export const productSchema = z.object({
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
  thumbnail: z.union([
    z.instanceof(Blob),
    z.string(),
    z.null(),
  ]).optional(),

  images: z
    .array(z.union([z.string(), z.instanceof(File)]))
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
});

export type DBVariantFormData = Database["public"]["Tables"]["productVariant"]["Row"]

// export type VariantFormData = {
//   size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONE_SIZE";
//   color: string;
//   stockQty: number;
//   status:
//   | "IN_STOCK"
//   | "LOW_STOCK"
//   | "OUT_OF_STOCK"
//   | "DISCONTINUED"
//   | "COMING_SOON";
//   price: number;
//   discountPrice?: number | null;
//   expiresAt?: string;
//   image?: File | string | null;
//   id: string;
// };