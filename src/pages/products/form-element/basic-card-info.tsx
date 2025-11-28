import { FC } from "react";
import { Editor } from "@tinymce/tinymce-react";
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
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useTheme } from "@/components/refine-ui/theme/theme-provider";
import { ProductFormData } from "../product-form";

interface BasicInfoCardProps {
  form: UseFormReturn<ProductFormData>;
}

export const BasicInfoCard: FC<BasicInfoCardProps> = ({
  form,
}) => {
  const { theme } = useTheme();
  return (
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

        {/* TinyMCE Editor */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Editor
                  key={theme}
                  apiKey={import.meta.env.VITE_TINYMCE_KEY}
                  initialValue="Write a detailed product description… Highlight features, materials, sizing, care instructions, and benefits."
                  value={field.value}
                  onEditorChange={field.onChange}
                  init={{
                    height: 300,
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
