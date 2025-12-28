export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  content: {
    Tables: {
      banner: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          images: string[]
          link: string
          multipleImages: boolean
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          images: string[]
          link: string
          multipleImages?: boolean
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          images?: string[]
          link?: string
          multipleImages?: boolean
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      collection: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          thumbnail: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          thumbnail: string
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          thumbnail?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          couponType: Database["content"]["Enums"]["CouponType"]
          createdAt: string
          discountAmount: number
          discountPercentage: number
          endDate: string
          id: string
          minCartValue: number
          startDate: string
          updatedAt: string
        }
        Insert: {
          code: string
          couponType: Database["content"]["Enums"]["CouponType"]
          createdAt?: string
          discountAmount?: number
          discountPercentage?: number
          endDate: string
          id: string
          minCartValue?: number
          startDate: string
          updatedAt: string
        }
        Update: {
          code?: string
          couponType?: Database["content"]["Enums"]["CouponType"]
          createdAt?: string
          discountAmount?: number
          discountPercentage?: number
          endDate?: string
          id?: string
          minCartValue?: number
          startDate?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CouponType: "PERCENTAGE" | "FIXED_AMOUNT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          createdAt: string
          district: string
          division: string
          id: string
          profileId: string
          upazila: string
          updatedAt: string
          zip: string
        }
        Insert: {
          address: string
          createdAt?: string
          district: string
          division: string
          id?: string
          profileId?: string
          upazila: string
          updatedAt?: string
          zip: string
        }
        Update: {
          address?: string
          createdAt?: string
          district?: string
          division?: string
          id?: string
          profileId?: string
          upazila?: string
          updatedAt?: string
          zip?: string
        }
        Relationships: []
      }
      category: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          coupon: string | null
          createdAt: string
          discountedPrice: number
          grandToken: string | null
          id: string
          orderStatus: Database["public"]["Enums"]["orderStatus"]
          paymentId: string | null
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"]
          paymentNumber: string | null
          paymentRemaining: number | null
          paymentTotal: number
          profileId: string
          refreshToken: string | null
          shippingCost: number
          transactionId: string | null
          updatedAt: string
        }
        Insert: {
          coupon?: string | null
          createdAt?: string
          discountedPrice: number
          grandToken?: string | null
          id: string
          orderStatus: Database["public"]["Enums"]["orderStatus"]
          paymentId?: string | null
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"]
          paymentNumber?: string | null
          paymentRemaining?: number | null
          paymentTotal: number
          profileId: string
          refreshToken?: string | null
          shippingCost: number
          transactionId?: string | null
          updatedAt: string
        }
        Update: {
          coupon?: string | null
          createdAt?: string
          discountedPrice?: number
          grandToken?: string | null
          id?: string
          orderStatus?: Database["public"]["Enums"]["orderStatus"]
          paymentId?: string | null
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"]
          paymentNumber?: string | null
          paymentRemaining?: number | null
          paymentTotal?: number
          profileId?: string
          refreshToken?: string | null
          shippingCost?: number
          transactionId?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      orderAddress: {
        Row: {
          address: string
          createdAt: string
          district: string
          division: string
          id: string
          orderId: string
          upazila: string
          updatedAt: string
          zip: string
        }
        Insert: {
          address: string
          createdAt?: string
          district: string
          division: string
          id: string
          orderId: string
          upazila: string
          updatedAt: string
          zip: string
        }
        Update: {
          address?: string
          createdAt?: string
          district?: string
          division?: string
          id?: string
          orderId?: string
          upazila?: string
          updatedAt?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "orderAddress_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      orderProduct: {
        Row: {
          color: string
          createdAt: string
          id: string
          image: string
          orderId: string
          price: number
          productId: string
          quantity: number
          size: string
          title: string
          updatedAt: string
          variantId: string
        }
        Insert: {
          color: string
          createdAt?: string
          id: string
          image: string
          orderId: string
          price: number
          productId: string
          quantity: number
          size: string
          title: string
          updatedAt: string
          variantId?: string
        }
        Update: {
          color?: string
          createdAt?: string
          id?: string
          image?: string
          orderId?: string
          price?: number
          productId?: string
          quantity?: number
          size?: string
          title?: string
          updatedAt?: string
          variantId?: string
        }
        Relationships: [
          {
            foreignKeyName: "orderProduct_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          authorId: string | null
          categoryId: string | null
          collectionId: string | null
          createdAt: string
          department: Database["public"]["Enums"]["Department"]
          description: string
          fts: unknown
          id: string
          images: string[] | null
          material: string | null
          meta: Json | null
          seoDescription: string | null
          seoKeywords: string[] | null
          seoTitle: string | null
          sku: string
          subCategoryId: string | null
          thumbnail: string | null
          title: string
          updatedAt: string
        }
        Insert: {
          authorId?: string | null
          categoryId?: string | null
          collectionId?: string | null
          createdAt?: string
          department?: Database["public"]["Enums"]["Department"]
          description: string
          fts?: unknown
          id?: string
          images?: string[] | null
          material?: string | null
          meta?: Json | null
          seoDescription?: string | null
          seoKeywords?: string[] | null
          seoTitle?: string | null
          sku: string
          subCategoryId?: string | null
          thumbnail?: string | null
          title: string
          updatedAt: string
        }
        Update: {
          authorId?: string | null
          categoryId?: string | null
          collectionId?: string | null
          createdAt?: string
          department?: Database["public"]["Enums"]["Department"]
          description?: string
          fts?: unknown
          id?: string
          images?: string[] | null
          material?: string | null
          meta?: Json | null
          seoDescription?: string | null
          seoKeywords?: string[] | null
          seoTitle?: string | null
          sku?: string
          subCategoryId?: string | null
          thumbnail?: string | null
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_subCategoryId_fkey"
            columns: ["subCategoryId"]
            isOneToOne: false
            referencedRelation: "subCategory"
            referencedColumns: ["id"]
          },
        ]
      }
      productVariant: {
        Row: {
          color: string
          createdAt: string
          discountPrice: number | null
          expiresAt: string | null
          id: string
          image: string | null
          price: number
          productId: string
          size: Database["public"]["Enums"]["Size"]
          status: Database["public"]["Enums"]["VariantStatus"]
          stockQty: number
          updatedAt: string
        }
        Insert: {
          color: string
          createdAt?: string
          discountPrice?: number | null
          expiresAt?: string | null
          id?: string
          image?: string | null
          price: number
          productId?: string
          size: Database["public"]["Enums"]["Size"]
          status?: Database["public"]["Enums"]["VariantStatus"]
          stockQty: number
          updatedAt: string
        }
        Update: {
          color?: string
          createdAt?: string
          discountPrice?: number | null
          expiresAt?: string | null
          id?: string
          image?: string | null
          price?: number
          productId?: string
          size?: Database["public"]["Enums"]["Size"]
          status?: Database["public"]["Enums"]["VariantStatus"]
          stockQty?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "productVariant_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      subCategory: {
        Row: {
          categoryId: string
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          categoryId: string
          createdAt?: string
          id?: string
          name: string
          updatedAt: string
        }
        Update: {
          categoryId?: string
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "subCategory_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Department: "MENS" | "WOMENS" | "KIDS" | "UNISEX" | "COUPLE"
      orderStatus:
        | "PENDING"
        | "PROCESSING"
        | "PACKAGING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
      PaymentMethod: "COD" | "BKASH"
      Role: "USER" | "ADMIN" | "MODERATOR"
      Size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONE_SIZE"
      VariantStatus:
        | "IN_STOCK"
        | "LOW_STOCK"
        | "OUT_OF_STOCK"
        | "DISCONTINUED"
        | "COMING_SOON"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  content: {
    Enums: {
      CouponType: ["PERCENTAGE", "FIXED_AMOUNT"],
    },
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      Department: ["MENS", "WOMENS", "KIDS", "UNISEX", "COUPLE"],
      orderStatus: [
        "PENDING",
        "PROCESSING",
        "PACKAGING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      PaymentMethod: ["COD", "BKASH"],
      Role: ["USER", "ADMIN", "MODERATOR"],
      Size: ["XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"],
      VariantStatus: [
        "IN_STOCK",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "DISCONTINUED",
        "COMING_SOON",
      ],
    },
  },
} as const
