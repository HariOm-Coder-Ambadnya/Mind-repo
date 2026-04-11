// components/ui/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
      {/* Top row: status + tags */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-gray-200 rounded-md" />
          <div className="h-5 w-12 bg-gray-200 rounded-md" />
          <div className="h-5 w-16 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Title */}
      <div className="h-7 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-7 w-1/2 bg-gray-200 rounded mb-4" />

      {/* Author row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
