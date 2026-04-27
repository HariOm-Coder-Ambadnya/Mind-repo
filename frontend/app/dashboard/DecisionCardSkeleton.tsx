import React from 'react';

export default function DecisionCardSkeleton() {
  return (
    <div className="animate-pulse p-4 border rounded-lg bg-white space-y-3">
      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>

      {/* Subtitle */}
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>

      {/* Description */}
      <div className="h-3 bg-gray-200 rounded w-full"></div>

      {/* Footer */}
      <div className="flex justify-between mt-3">
        <div className="h-3 w-10 bg-gray-200 rounded"></div>
        <div className="h-3 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}