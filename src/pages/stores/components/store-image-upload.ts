import { supabaseClient } from "@/lib";

const STORE_IMAGE_BUCKET = "content";
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const STORE_IMAGE_MAX_WIDTH = 1000;
const STORE_IMAGE_QUALITY = 0.75;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function generateStoreImageFileName(file: File) {
  const timestamp = Date.now();
  const extension = "jpg";

  const safeName =
    file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 60) || "store-image";

  return `stores/${timestamp}-${safeName}.${extension}`;
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
  }
}

export async function compressImage(
  file: File,
  maxWidth = STORE_IMAGE_MAX_WIDTH,
  quality = STORE_IMAGE_QUALITY,
): Promise<File> {
  validateImageFile(file);

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  image.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image."));
  });

  const shouldResize = image.width > maxWidth;
  const scale = shouldResize ? maxWidth / image.width : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error("Could not process image.");
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(imageUrl);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }

        resolve(
          new File([blob], generateStoreImageFileName(file), {
            type: "image/jpeg",
          }),
        );
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function uploadStoreImage(file: File): Promise<string> {
  const compressedFile = await compressImage(file);
  const filePath = compressedFile.name;

  const { data, error } = await supabaseClient.storage
    .from(STORE_IMAGE_BUCKET)
    .upload(filePath, compressedFile, {
      cacheControl: "31536000",
      upsert: false,
      contentType: "image/jpeg",
    });

  if (error) {
    throw error;
  }

  return `${STORE_IMAGE_BUCKET}/${data.path}`;
}

export function getStoreImagePreviewUrl(imagePath: string | null | undefined) {
  if (!imagePath) return "";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith(`${STORE_IMAGE_BUCKET}/`)
    ? imagePath.replace(`${STORE_IMAGE_BUCKET}/`, "")
    : imagePath;

  const { data } = supabaseClient.storage
    .from(STORE_IMAGE_BUCKET)
    .getPublicUrl(normalizedPath);

  return data.publicUrl;
}
