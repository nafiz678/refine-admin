import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailUploadFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ThumbnailUploadField({ value, onChange }: ThumbnailUploadFieldProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // return file;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const inputId = `thumbnail-input-${Math.random()}`;

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value || "/placeholder.svg"}
            alt="Thumbnail preview"
            className="h-40 w-40 rounded-lg border border-border/50 object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed transition-colors ${
            isDragActive
              ? 'border-accent/60 bg-accent/8'
              : 'border-border/30 bg-background hover:border-border/50'
          } p-10 text-center`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">Upload Thumbnail</p>
          <p className="mt-1 text-xs text-muted-foreground">Drag and drop or select file</p>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 border-border/50"
            onClick={() => {
              document.getElementById(inputId)?.click();
            }}
          >
            Select File
          </Button>
        </div>
      )}
    </div>
  );
}
