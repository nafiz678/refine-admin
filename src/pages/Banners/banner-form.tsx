import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BannerProp } from "./banner-list";
import { supabaseClient } from "@/lib";
import { QueryObserverResult } from "@tanstack/react-query";

type RefetchType = () => Promise<QueryObserverResult>;

export type BannerFormProps = {
  bannerInfo?: BannerProp;
  handleDialog: () => void;
  refetchBanners?: RefetchType;
};

const BannerForm = ({
  bannerInfo,
  handleDialog,
  refetchBanners,
}: BannerFormProps) => {
  const [isLoading, setIsLoading] =
    useState<boolean>(false);
  const form = useForm<BannerProp>({
    defaultValues: bannerInfo ?? {
      id: "",
      title: "",
      description: null,
      images: [],
      link: "",
      multipleImages: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  // Remove a specific image
  const removeImage = (index: number) => {
    const updatedImages = [...form.getValues("images")];
    updatedImages.splice(index, 1);
    form.setValue("images", updatedImages, {
      shouldDirty: true,
    });
    toast.success("Image removed");
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    form.setValue(
      "images",
      [...form.getValues("images"), blobUrl],
      {
        shouldDirty: true,
      }
    );
  };

  // Submit
  const onSubmit = async (values: BannerProp) => {
    // TODO: Uncomment this phrase when image problem is fixed
    // if (!values.images || values.images.length === 0) {
    //   toast.error("Please upload at least one image.");
    //   return;
    // }
    try {
      if (bannerInfo) {
        setIsLoading(true);
        const { error } = await supabaseClient
          .schema("content")
          .from("banner")
          .update({
            ...values,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", bannerInfo.id);

        if (error) {
          toast.error(
            `Failed to update banner: ${error.message}`
          );
        } else {
          toast.success("Banner updated successfully!");
          await refetchBanners?.();
          handleDialog();
          console.log("object");
        }
        setIsLoading(false);
        return;
      } else {
        setIsLoading(true);
        const { error } = await supabaseClient
          .schema("content")
          .from("banner")
          .insert([
            {
              ...values,
              id: Date.now().toString(36),
              updatedAt: new Date().toISOString(),
            },
          ]);

        if (error) {
          toast.error(
            `Failed to create banner: ${error.message}`
          );
          return;
        }

        toast.success("Banner created successfully!");
        form.reset();
        await refetchBanners?.();
        handleDialog();
      }
    } catch (error) {
      toast.error(`Something went wrong: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4 w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your banner title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Link */}
          <FormField
            control={form.control}
            name="link"
            rules={{ required: "Link is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter URL"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Link for the banner (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                Describe your banner
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            {form.watch("images").map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  alt={`banner-${idx}`}
                  className="aspect-video h-28 w-full rounded-md object-cover"
                  src={img}
                />
                <Button
                  className="absolute top-1 right-1"
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={() => removeImage(idx)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Upload */}
          <Label
            htmlFor="image"
            className="flex aspect-video h-28 w-full items-center justify-center rounded-md border border-dashed cursor-pointer"
          >
            <Upload className="size-4 text-muted-foreground" />
          </Label>
          <Input
            type="file"
            id="image"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button type="submit">
            {bannerInfo ? "Update" : "Create"} Banner
          </Button>
          <Button
            variant="destructive"
            type="button"
            disabled={isLoading}
            onClick={() => {
              form.reset();
              handleDialog();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BannerForm;
