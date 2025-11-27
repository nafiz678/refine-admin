import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
} from "@/components/ui/cropper";

interface ThumbnailCropperProps {
  existingThumbnailUrl?: string;
  name?: "thumbnail";
}

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function ThumbnailCropper({
  existingThumbnailUrl,
  name = "thumbnail",
}: ThumbnailCropperProps) {
  const {
    setValue,
    watch,
  } = useFormContext<{
    thumbnail: Blob | string | null;
  }>();
  const thumbnail = watch(name);

  const [fileUrl, setFileUrl] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<
    string | null
  >(existingThumbnailUrl ?? null);

  // Cleanup old object URLs
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    };
  }, [fileUrl, previewUrl]);

  // Watch for changes in form field for external updates (edit mode)
  useEffect(() => {
    if (thumbnail instanceof Blob) {
      const url = URL.createObjectURL(thumbnail);
      setPreviewUrl(url);
    } else if (typeof thumbnail === "string") {
      setPreviewUrl(thumbnail);
    }
  }, [thumbnail]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setOpen(true);

    e.target.value = "";
  };

  const cropImage = async () => {
    if (!fileUrl || !cropArea) return;

    const img = await loadImage(fileUrl);
    const blob = await cropToBlob(img, cropArea);

    setValue(name, blob, { shouldValidate: true });

    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    setOpen(false);
  };

  const preview =
  previewUrl && !previewUrl.startsWith("blob:")
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${previewUrl}`
    : previewUrl;


  return (
    <div className="flex flex-col gap-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {previewUrl && (
        <div className="relative w-32 h-32 group rounded-lg overflow-hidden shadow-lg border">
          <img
            src={preview || undefined}
            alt="Thumbnail Preview"
            className="h-full w-full object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <button
            type="button"
            onClick={() => {
              setValue("thumbnail", null, {
                shouldValidate: true,
              });
              setPreviewUrl(null);
              setFileUrl(null);
            }}
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-background text-foreground/50 rounded-full shadow hover:bg-destructive hover:text-background transition-colors duration-200"
          >
            ✕
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogTitle>Crop Image As Desired</DialogTitle>
          {fileUrl && (
            <>
              <Cropper
                image={fileUrl}
                className="h-80"
                cropPadding={20}
                onCropChange={setCropArea}
              >
                <CropperImage />
                <CropperCropArea />
              </Cropper>

              <Button
                className="mt-4 w-full"
                onClick={cropImage}
              >
                Crop & Save
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Failed to load image"));
  });
}

function cropToBlob(
  image: HTMLImageElement,
  crop: CropArea
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to crop image"));
      },
      "image/jpeg",
      0.9
    );
  });
}
