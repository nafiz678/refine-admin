import z from "zod";
import type { supabaseClient } from "@/lib";
import { ALL_VALUE } from "@/pages/stores/components/constants";
import { Database, Enums, Tables } from "./supabase";

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


// store types

export type AppSupabaseClient = typeof supabaseClient;

export type StoreRow = Tables<"storeInformation">;
export type StoreType = Enums<"StoreType">;

export type SortValue = "newest" | "oldest" | "name_asc" | "name_desc";

export type StoreFilters = {
  search: string;
  city: string;
  area: string;
  storeType: StoreType | typeof ALL_VALUE;
  status: "active" | "inactive" | typeof ALL_VALUE;
  sort: SortValue;
};

export type StoreFormValues = {
  store_name: string;
  store_type: StoreType;
  city: string;
  area: string;
  address: string;
  contact_no: string;
  google_map_url: string;
  facebook_page_url: string;
  image: string;
  is_active: boolean;
};
