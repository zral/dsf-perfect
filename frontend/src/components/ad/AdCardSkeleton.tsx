"use client";

export default function AdCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
        <div className="h-5 bg-blue-50 rounded-lg w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
