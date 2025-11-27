import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { VariantFormData } from "@/lib/type";
import { toast } from "sonner";
import { useEffect } from "react";

interface VariantsCardProps {
  initialVariants?: VariantFormData[];
  variantFields: VariantFormData[];
  setVariantFields: React.Dispatch<
    React.SetStateAction<VariantFormData[]>
  >;
}

export function VariantsCard({
  initialVariants,
  variantFields,
  setVariantFields,
}: VariantsCardProps) {
  // Initialize variants with unique IDs
  useEffect(() => {
    if (!initialVariants) return;
    if (initialVariants.length > 0) {
      const variantsWithId = initialVariants.map((v) => ({
        ...v,
      }));
      setVariantFields(variantsWithId);
    }
  }, [initialVariants, setVariantFields]);

  const addVariant = () => {
    setVariantFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        size: "M",
        color: "",
        stockQty: 0,
        status: "IN_STOCK",
        price: 0,
        discountPrice: 0,
        expiresAt: "",
        image: undefined,
      },
    ]);
  };

  const removeVariant = (index: string) => {
    setVariantFields((prev) =>
      prev.filter((i) => i.id !== index)
    );
  };

  const updateVariant = (
    id: string,
    value: Partial<VariantFormData>
  ) => {
    setVariantFields((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, ...value } : v
      )
    );
  };

  const handleImageChange = (id: string, file: File | null) => {
    if (!file) return;
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Maximum size allowed is 2MB.");
      return;
    }
    updateVariant(id, { image: file });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
        <CardDescription>
          Add different sizes, colors, pricing, and images for this product.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {variantFields.map((variant) => (
          <Card key={variant.id} className="border p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Size */}
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select
                  value={variant.size}
                  onValueChange={(val) =>
                    updateVariant(variant.id!, { size: val as VariantFormData["size"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["XS","S","M","L","XL","XXL","ONE_SIZE"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {/* Color */}
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input
                    value={variant.color}
                    onChange={(e) => updateVariant(variant.id!, { color: e.target.value })}
                    placeholder="e.g., Red"
                  />
                </FormControl>
              </FormItem>

              {/* Stock Quantity */}
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={variant.stockQty}
                    onChange={(e) => updateVariant(variant.id!, { stockQty: Number(e.target.value) })}
                  />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-2">
              {/* Status */}
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={variant.status}
                  onValueChange={(val) => updateVariant(variant.id!, { status: val as VariantFormData["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["IN_STOCK","LOW_STOCK","OUT_OF_STOCK","DISCONTINUED","COMING_SOON"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {/* Price */}
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id!, { price: Number(e.target.value) })}
                  />
                </FormControl>
              </FormItem>

              {/* Discount Price */}
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={variant.discountPrice}
                    onChange={(e) => updateVariant(variant.id!, { discountPrice: Number(e.target.value) })}
                  />
                </FormControl>
              </FormItem>
            </div>

            {/* Image */}
            <FormItem className="mt-2">
              <FormLabel>Variant Image</FormLabel>
              <FormControl>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(variant.id!, e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              {variant.image && (
                <img
                  src={typeof variant.image === "string" ? variant.image : URL.createObjectURL(variant.image)}
                  alt="Variant Preview"
                  className="mt-2 h-24 w-24 object-cover rounded"
                />
              )}
            </FormItem>

            {/* Expires At & Remove */}
            <div className="flex justify-between items-center mt-2">
              <FormItem>
                <FormLabel>Expires At</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={variant.expiresAt}
                    onChange={(e) => updateVariant(variant.id!, { expiresAt: e.target.value })}
                  />
                </FormControl>
              </FormItem>

              <Button variant="destructive" onClick={() => removeVariant(variant.id!)} size="sm">
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            </div>
          </Card>
        ))}

        <Button type="button" onClick={addVariant} className="mt-2">
          Add Variant
        </Button>
      </CardContent>
    </Card>
  );
}
