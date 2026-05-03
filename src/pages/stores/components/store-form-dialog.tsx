import { StoreFormValues, StoreRow, StoreType } from "@/lib/type";
import { useEffect, useState } from "react";
import { defaultFormValues, storeTypes } from "./constants";
import { toFormValues } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import {
  getStoreImagePreviewUrl,
  uploadStoreImage,
} from "./store-image-upload";

export function StoreFormDialog({
  open,
  mode,
  store,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  store: StoreRow | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StoreFormValues) => void;
}) {
  const [values, setValues] = useState<StoreFormValues>(defaultFormValues);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  useEffect(() => {
    if (!open) return;

    const nextValues = toFormValues(store);

    setValues(nextValues);
    setImagePreview(getStoreImagePreviewUrl(nextValues.image));
    setImageUploadError("");
  }, [open, store]);

  const isValid =
    values.store_name.trim().length > 1 &&
    values.address.trim().length > 4 &&
    values.contact_no.trim().length > 4 &&
    values.google_map_url.trim().length > 6;

  function setField<K extends keyof StoreFormValues>(
    key: K,
    value: StoreFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageUploadError("");
    setIsUploadingImage(true);

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      const uploadedPath = await uploadStoreImage(file);

      setField("image", uploadedPath);
      setImagePreview(getStoreImagePreviewUrl(uploadedPath));
    } catch (error) {
      setImagePreview(getStoreImagePreviewUrl(values.image));
      setImageUploadError(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
      URL.revokeObjectURL(localPreview);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Add new store" : "Edit store"}
          </DialogTitle>
          <DialogDescription>
            Manage all public locator information. Required fields are store
            name, type, address, contact, and Google Maps URL.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store name</Label>
            <Input
              id="store_name"
              value={values.store_name}
              onChange={(event) => setField("store_name", event.target.value)}
              placeholder="Store name"
            />
          </div>

          <div className="space-y-2">
            <Label>Store type</Label>
            <Select
              value={values.store_type}
              onValueChange={(value) =>
                setField("store_type", value as StoreType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {storeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(event) => setField("city", event.target.value)}
              placeholder="Dhaka"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              value={values.area}
              onChange={(event) => setField("area", event.target.value)}
              placeholder="Mirpur"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(event) => setField("address", event.target.value)}
              placeholder="Full store address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_no">Contact number</Label>
            <Input
              id="contact_no"
              value={values.contact_no}
              onChange={(event) => setField("contact_no", event.target.value)}
              placeholder="01750515011"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_map_url">Google Maps URL</Label>
            <Input
              id="google_map_url"
              value={values.google_map_url}
              onChange={(event) =>
                setField("google_map_url", event.target.value)
              }
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook_page_url">Facebook page URL</Label>
            <Input
              id="facebook_page_url"
              value={values.facebook_page_url}
              onChange={(event) =>
                setField("facebook_page_url", event.target.value)
              }
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="store-image">Store image</Label>

            <div className="grid gap-4 rounded-2xl border p-4 md:grid-cols-[180px_1fr]">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Store preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">No image</span>
                  </div>
                )}

                {isUploadingImage ? (
                  <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-center gap-3">
                <div>
                  <Input
                    id="store-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    disabled={isUploadingImage || isSaving}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingImage || isSaving}
                      onClick={() =>
                        document.getElementById("store-image")?.click()
                      }
                      className="cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {values.image ? "Replace image" : "Upload image"}
                    </Button>

                    {values.image ? (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isUploadingImage || isSaving}
                        onClick={() => {
                          setField("image", "");
                          setImagePreview("");
                          setImageUploadError("");
                        }}
                        className="cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Upload JPG, PNG, or WEBP. The image will be compressed and
                    stored in the Supabase{" "}
                    <span className="font-medium">content</span> bucket.
                  </p>

                  {values.image ? (
                    <p className="break-all text-xs text-muted-foreground">
                      Stored path: {values.image}
                    </p>
                  ) : null}

                  {imageUploadError ? (
                    <p className="text-sm font-medium text-red-600">
                      {imageUploadError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4 md:col-span-2">
            <div>
              <Label htmlFor="is_active" className="text-base">
                Visible on locator page
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Inactive stores stay saved but are hidden from users.
              </p>
            </div>
            <Switch
              id="is_active"
              checked={values.is_active}
              onCheckedChange={(checked) => setField("is_active", checked)}
              className="cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            disabled={!isValid || isSaving || isUploadingImage}
            onClick={() => onSubmit(values)}
            className="cursor-pointer"
          >
            {isSaving || isUploadingImage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isUploadingImage
              ? "Uploading image..."
              : mode === "create"
                ? "Create store"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
