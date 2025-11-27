import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BannerProp } from "./banner-list";
import { supabaseClient } from "@/lib";
import { QueryObserverResult } from "@tanstack/react-query";
import { BannerImageCropper } from "./banner-image-cropper";

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
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [croppedBlobs, setCroppedBlobs] = useState<Blob[]>(
    []
  );

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

  // Remove an image by index
  const removeImage = (idx: number) => {
    const updatedImages = [...form.getValues("images")];
    const updatedBlobs = [...croppedBlobs];
    updatedImages.splice(idx, 1);
    updatedBlobs.splice(idx, 1);

    form.setValue("images", updatedImages, {
      shouldDirty: true,
    });
    setCroppedBlobs(updatedBlobs);

    toast.success("Image removed");
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setSelectedFile(file);
    setCropperOpen(true);
  };

  // Handle cropped image
  const handleCropped = (
    previewUrl: string,
    blob: Blob
  ) => {
    form.setValue(
      "images",
      [...form.getValues("images"), previewUrl],
      { shouldDirty: true }
    );
    setCroppedBlobs([...croppedBlobs, blob]);
    toast.success("Image cropped successfully!");
  };

  // Upload a single image to Supabase storage
  const uploadImage = async (
    blob: Blob,
    fileName: string
  ): Promise<string> => {
    const { data, error } = await supabaseClient.storage
      .from("content")
      .upload(fileName, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    return data.path;
  };

  const onSubmit = async (values: BannerProp) => {
    if (
      !values.images ||
      values.images.length === 0 ||
      !croppedBlobs.length
    ) {
      toast.error("Please upload one banner image.");
      return;
    }

    try {
      setIsLoading(true);

      // Upload all blobs
      const uploadedUrls: string[] = [];
      for (let i = 0; i < croppedBlobs.length; i++) {
        const blob = croppedBlobs[i];
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}.jpg`;
        const url = await uploadImage(blob, fileName);
        uploadedUrls.push(`content/${url}`);
      }

      const payload = {
        ...values,
        images: uploadedUrls,
        updatedAt: new Date().toISOString(),
      };

      if (bannerInfo) {
        const { error } = await supabaseClient
          .schema("content")
          .from("banner")
          .update(payload)
          .eq("id", bannerInfo.id);

        if (error) throw error;

        toast.success("Banner updated!");
      } else {
        const { error } = await supabaseClient
          .schema("content")
          .from("banner")
          .insert([
            { ...payload, id: Date.now().toString(36) },
          ]);

        if (error) throw error;
        toast.success("Banner created!");
      }

      await refetchBanners?.();
      form.reset();
      handleDialog();
    } catch (err) {
      toast.error(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Cropper Modal */}
      <BannerImageCropper
        open={cropperOpen}
        file={selectedFile}
        onOpenChange={setCropperOpen}
        onCropped={handleCropped}
      />

      <Form {...form}>
        <form
          className="space-y-4 w-full"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Optional banner link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Describe your banner
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image List */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {form.watch("images").map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    className="aspect-video h-28 w-full rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1"
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
              htmlFor="banner-upload"
              className="flex aspect-video h-28 w-full items-center justify-center rounded-md border border-dashed cursor-pointer"
            >
              <Upload className="text-muted-foreground size-4" />
            </Label>

            <Input
              id="banner-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {/* Form Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {bannerInfo ? "Update" : "Create"} Banner
            </Button>
            <Button
              variant="destructive"
              type="button"
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
    </>
  );
};

export default BannerForm;
