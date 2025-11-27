import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
} from "@/components/ui/cropper";

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function BannerImageCropper({
  file,
  open,
  onOpenChange,
  onCropped,
}: {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropped: (previewUrl: string, blob: Blob) => void;
}) {
  const [cropArea, setCropArea] = useState<CropArea | null>(
    null
  );
  const [fileUrl, setFileUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const cropImage = async () => {
    if (!fileUrl || !cropArea) return;

    const image = await loadImage(fileUrl);
    const blob = await cropToBlob(image, cropArea);
    const previewUrl = URL.createObjectURL(blob);

    onCropped(previewUrl, blob);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Crop Banner Image</DialogTitle>

        {fileUrl && (
          <>
            <Cropper
              image={fileUrl}
              className="h-80"
              cropPadding={20}
              onCropChange={setCropArea}
              aspectRatio={21 / 9}
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
  );
}


/**
 * Helper Functions
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
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

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      "image/jpeg",
      0.9
    );
  });
}
