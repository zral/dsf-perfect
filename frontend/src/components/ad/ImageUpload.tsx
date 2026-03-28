"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, X, Upload } from "lucide-react";

interface UploadedImage {
  file: File;
  preview: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newImages: UploadedImage[] = [];
      const remaining = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      for (const file of filesToProcess) {
        if (file.type.startsWith("image/")) {
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
          });
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const updated = [...images];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      onChange(updated);
    },
    [images, onChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Legg til bilder
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dra og slipp eller klikk for å velge
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Upload className="h-3 w-3" />
            <span>
              {images.length}/{maxImages} bilder
            </span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
            >
              <img
                src={image.preview}
                alt={`Bilde ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  Hovedbilde
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { UploadedImage };
