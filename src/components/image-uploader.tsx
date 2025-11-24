import {
  AlertCircleIcon,
  ImageUpIcon,
  XIcon,
} from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect } from "react";

type ImageUploaderProps = {
  onUploadComplete?: (urls: string[]) => void; // return uploaded URLs or paths
};

export default function ImageUploader({
  onUploadComplete,
}: ImageUploaderProps) {
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  });
  
  useEffect(() => {
    if (onUploadComplete && files.length > 0) {
      const previewUrls = files
        .map((f) => f.preview)
        .filter((url): url is string => Boolean(url)); // type narrowing

      onUploadComplete(previewUrls);
    }
  }, [files]);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Area */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 
          data-[dragging=true]:bg-accent/50 cursor-pointer"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload files"
        />

        {/* Only show placeholder if no images */}
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div className="mb-2 flex size-11 items-center justify-center rounded-full border bg-background">
              <ImageUpIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              Drop your images here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSizeMB}MB each
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add more images...
          </p>
        )}
      </div>

      {/* Image Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative overflow-hidden rounded-lg border border-border"
            >
              <img
                src={file.preview}
                alt={file.file.name}
                className="object-cover w-full h-32"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                aria-label="Remove image"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
