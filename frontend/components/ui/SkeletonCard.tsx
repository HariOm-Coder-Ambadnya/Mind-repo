// components/ui/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Outer container with gray background and rounded corners */}
      <div className="p-6 bg-gray-200 rounded w-3/4"></div>
      
      {/* Title skeleton - two lines */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Author info skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>

      {/* Stats row skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
