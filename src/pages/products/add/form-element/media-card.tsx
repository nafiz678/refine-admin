import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ThumbnailCropper } from "../thumnail-cropper";
import { ProductFormData } from "../product-add-form";
import { MultipleImageUploadField } from "../multiple-image-upload";

interface MediaCardProps {
  form: UseFormReturn<ProductFormData>;
}

export function MediaCard({ form }: MediaCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Media</CardTitle>
        <CardDescription>Product images and thumbnails</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Thumbnail */}
        <FormField
          control={form.control}
          name="thumbnail"
          render={() => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <ThumbnailCropper />
              </FormControl>
              <FormDescription>Recommended Ratio: 1:1 — Max 5MB</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Images */}
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
                Upload up to 5 images (JPG/PNG — Max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
