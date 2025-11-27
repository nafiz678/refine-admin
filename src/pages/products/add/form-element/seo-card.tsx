import { FC } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProductFormData } from "../../product-form";
import { UseFormReturn } from "react-hook-form";
import { KeywordsField } from "../keywords-field";

interface SEOCardProps {
  form: UseFormReturn<ProductFormData>;
}

export const SEOCard: FC<SEOCardProps> = ({ form }) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">SEO</CardTitle>
        <CardDescription>
          Search engine optimization details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SEO Title */}
        <FormField
          control={form.control}
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="50-60 characters"
                  maxLength={60}
                  {...field}
                  className="border-border/50"
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/60 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Description */}
        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="150–160 characters"
                  maxLength={160}
                  {...field}
                  className="resize-none border-border/50"
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/160 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Keywords */}
        <FormField
          control={form.control}
          name="seoKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Keywords</FormLabel>
              <FormControl>
                <KeywordsField
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Add keywords separated by Enter or comma
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
