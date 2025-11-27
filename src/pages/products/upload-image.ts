// upload-image.ts
import { supabaseClient } from "@/lib";

/**
 * Convert base64 string to File
 */
export function base64ToFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], filename, { type: mime });
}

/**
 * Compress image using canvas
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  const scale = maxWidth / img.width;

  canvas.width = img.width > maxWidth ? maxWidth : img.width;
  canvas.height = img.height * (img.width > maxWidth ? scale : 1);

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(new File([blob!], file.name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Generate filename
 */
export function generateFileName() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${timestamp}_${randomStr}.JPG`;
}

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket = "product"
): Promise<string> {
  const filePath = generateFileName();

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return data.path;
}

/**
 * Upload a thumbnail base64 string
 */
export const uploadThumbnail = async (file: Blob) => {
  const fileName = generateFileName();
  const { data, error } = await supabaseClient.storage
    .from("product")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  return data.path;
};

/**
 * Upload multiple images (array of base64 strings)
 */
export async function uploadImages(base64Images: string[]): Promise<string[]> {
  const promises = base64Images.map(async (b64, i) => {
    const file = base64ToFile(b64, `image-${i}.jpg`);
    const compressed = await compressImage(file, 1200, 0.8);
    return uploadFile(compressed, "product");
  });
  return Promise.all(promises);
}

/**
 * Upload variant image
 * Compresses the image before uploading
 */
export async function uploadVariantImage(file: File): Promise<string> {
  const compressed = await compressImage(file, 800, 0.7);
  return uploadFile(compressed, "product");
}
