// components/decisions/DecisionCardSkeleton.tsx
export default function DecisionCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Status badge */}
      <div className="h-6 w-24 bg-gray-200 rounded-full" />

      {/* Title lines */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Author info */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
