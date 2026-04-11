// components/decisions/DecisionCard.tsx
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, ThumbsUp } from 'lucide-react';
import { Decision, DecisionStatus } from '@/lib/api';
import StatusBadge from './StatusBadge';

interface DecisionCardProps {
  decision: Decision;
  showRepo?: boolean;
}

const statusColors = {
  PROPOSED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  SUPERSEDED: 'bg-amber-100 text-amber-800',
  DEPRECATED: 'bg-red-100 text-red-800',
};

export default function DecisionCard({ decision, showRepo = true }: DecisionCardProps) {
  return (
    <Link 
      href={`/decisions/${decision.id}`}
      className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Top row: status badge + tags */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={decision.status} />
        <div className="flex gap-1 flex-wrap max-w-xs">
          {decision.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {decision.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{decision.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
        {decision.title}
      </h3>

      {/* Author row */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <img
          src={decision.authorAvatar || '/default-avatar.png'}
          alt={decision.authorName}
          className="w-6 h-6 rounded-full"
        />
        <span>{decision.authorName}</span>
        <span className="text-gray-400">•</span>
        <span>{formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}</span>
      </div>

      {/* Bottom row: repo badge | comment count | vote score | view count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {showRepo && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              {decision.repoName}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{decision.commentCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{decision.voteScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{decision.viewCount}</span>
        </div>
      </div>
    </Link>
  );
}
