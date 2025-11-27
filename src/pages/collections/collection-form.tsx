import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollectionProp } from "./collections";
import { formatTime } from "@/lib/utils";
import { X } from "lucide-react";

interface CollectionFormProps {
  initialData?: CollectionProp;
  onSubmit: (
    data: Omit<
      CollectionProp,
      "id" | "createdAt" | "updatedAt"
    > & { thumbnail: string | File }
  ) => void;
  onCancel: () => void;
}

export function CollectionForm({
  initialData,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [thumbnail, setThumbnail] = useState<string | File>(
    initialData?.thumbnail || ""
  );
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim())
      newErrors.title = "Title is required";
    if (title.length > 100)
      newErrors.title =
        "Title must be less than 100 characters";
    if (description.length > 500)
      newErrors.description =
        "Description must be less than 500 characters";
    return newErrors;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors({
        ...errors,
        thumbnail: "Only image files are allowed",
      });
      return;
    }
    setThumbnail(file);
    if (errors.thumbnail)
      setErrors({ ...errors, thumbnail: "" });
  };

  const handleRemoveImage = () => setThumbnail("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    onSubmit({ title, description, thumbnail });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Collection name"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title)
              setErrors({ ...errors, title: "" });
          }}
          className={
            errors.title ? "border-destructive" : ""
          }
        />
        {errors.title && (
          <p className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      {/* Image Field */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail</Label>

        <div
          className={`relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer transition-all ${
            errors.thumbnail
              ? "border-destructive"
              : "border-border"
          } hover:border-primary`}
        >
          {/* Overlay text if no thumbnail */}
          {!thumbnail && (
            <label
              htmlFor="thumbnail"
              className="absolute inset-0 flex flex-col items-center justify-center text-center text-sm text-muted-foreground cursor-pointer"
            >
              <span>Click or drag file here</span>
              <span className="mt-1 text-xs text-muted-foreground/70">
                PNG, JPG, GIF up to 5MB
              </span>
            </label>
          )}

          {/* Show preview if thumbnail exists */}
          {thumbnail && (
            <>
              <img
                src={
                  typeof thumbnail === "string"
                    ? `${
                        import.meta.env.VITE_SUPABASE_URL
                      }/storage/v1/object/public/${thumbnail}`
                    : URL.createObjectURL(thumbnail)
                }
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
              >
                <X size={16} />
              </button>
            </>
          )}

          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {errors.thumbnail && (
          <p className="text-sm text-destructive mt-1">
            {errors.thumbnail}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of the collection"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors({ ...errors, description: "" });
          }}
          className={
            errors.description ? "border-destructive" : ""
          }
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {description.length}/500
        </p>
      </div>

      {/* Read-only fields */}
      {initialData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Created At
            </Label>
            <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {formatTime(initialData.createdAt)}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Updated At
            </Label>
            <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {formatTime(initialData.updatedAt)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
