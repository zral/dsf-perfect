"use client";

import { Camera } from "lucide-react";

interface ImagePlaceholderProps {
  className?: string;
}

export default function ImagePlaceholder({ className = "" }: ImagePlaceholderProps) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
    >
      <Camera className="h-10 w-10 text-gray-300" />
    </div>
  );
}
