import { ChangeEvent, useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface MultipleImageUploadFieldProps {
  value?: (string | Blob)[];
  onChange: (value: (string | Blob)[]) => void;
}

export function MultipleImageUploadField({
  value = [],
  onChange,
}: MultipleImageUploadFieldProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate previews for blobs
  useEffect(() => {
    const urls = value.map((item) => {
      if (item instanceof Blob) return URL.createObjectURL(item);
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${item}`;
    });
    setPreviewUrls(urls);

    // Cleanup blob URLs
    return () => {
      urls.forEach((url, i) => {
        if (value[i] instanceof Blob) URL.revokeObjectURL(url);
      });
    };
  }, [value]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = ""; // allow re-adding same file
  };

  const handleFiles = (files: File[]) => {
    let validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning(`Skipped ${file.name}: not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`Skipped ${file.name}: exceeds 5MB`);
        return false;
      }
      return true;
    });

    const remainingSlots = 5 - value.length;
    validFiles = validFiles.slice(0, remainingSlots);

    if (validFiles.length === 0) {
      toast.error(
        "No valid images to upload, or maximum 5 images reached"
      );
      return;
    }

    onChange([...value, ...validFiles]);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const inputId = useId();

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {previewUrls.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="aspect-square rounded-lg border border-border/50 object-cover shadow-sm"
              />
              <div className="absolute inset-0 lg:bg-black/40 rounded-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-full bg-destructive p-2 text-white hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-medium text-foreground">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length < 5 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed transition-colors ${
            isDragActive
              ? "border-accent/60 bg-accent/8"
              : "border-border/30 bg-background hover:border-border/50"
          } p-8 text-center`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Add More Images {value.length > 0 && `(${value.length}/5)`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Drag and drop or select files
          </p>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 border-border/50"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>
      )}

      {value.length >= 5 && (
        <div className="rounded-lg bg-muted/50 border border-border/30 p-4 text-center text-sm text-muted-foreground">
          Maximum 5 images reached
        </div>
      )}
    </div>
  );
}
