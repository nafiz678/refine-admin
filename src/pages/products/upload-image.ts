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
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket = "product"
): Promise<string> {
  const filePath = generateFileName(file.name);

  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: publicData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}

/**
 * Upload a thumbnail base64 string
 */
export async function uploadThumbnail(base64: string): Promise<string | null> {
  if (!base64) return null;

  const file = base64ToFile(base64, "thumbnail.jpg");
  const compressed = await compressImage(file, 800, 0.8);
  return await uploadFile(compressed, "product");
}

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


function generateFileName(originalName: string) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  const ext = originalName.split(".").pop(); 
  return `${timestamp}_${randomStr}.${ext}`;
}
