import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
} from "@/components/ui/cropper";

type CropArea = { x: number; y: number; width: number; height: number };

export function ThumbnailCropper() {
  const { setValue } = useFormContext<{ thumbnail: Blob | null }>();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setOpen(true);
  };

  const cropImage = async () => {
    if (!fileUrl || !cropArea) return;

    const img = await loadImage(fileUrl);
    const blob = await cropToBlob(img, cropArea);

    setValue("thumbnail", blob, { shouldValidate: true });

    const previewUrl = URL.createObjectURL(blob);
    setThumbnailPreview(previewUrl);

    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Input type="file" accept="image/*" onChange={handleFileChange} />

      {thumbnailPreview && (
        <img
          src={thumbnailPreview}
          className="h-32 w-32 rounded-lg border object-cover shadow"
          alt="Thumbnail Preview"
        />
      )}

      <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent className="max-w-xl">
            <DialogTitle>
                Crop Image As Desired
            </DialogTitle>
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

              <Button className="mt-4 w-full" onClick={cropImage}>
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
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
  });
}

function cropToBlob(image: HTMLImageElement, crop: CropArea): Promise<Blob> {
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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
  });
}
