// app/decisions/[id]/DecisionDetailClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  GitPullRequest,
  Eye,
  Plus,
  MessageSquare,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { DecisionDetail, deleteDecision, DecisionStatus, Comment as ApiComment } from "@/lib/api";
import StatusBadge from "@/components/decisions/StatusBadge";
import VoteButtons from "@/components/decisions/VoteButtons";
import CommentThread from "@/components/decisions/CommentThread";
import PrLinkModal from "@/components/decisions/PrLinkModal";
import TiptapEditor from "@/components/decisions/TiptapEditor";

interface DecisionDetailClientProps {
  decision: DecisionDetail;
}

const statusConfig = {
  open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
  closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
  merged: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Merged' },
};

export default function DecisionDetailClient({ decision: initialDecision }: DecisionDetailClientProps) {
  const [decision, setDecision] = useState<DecisionDetail>(initialDecision);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this decision?")) return;
    
    setIsDeleting(true);
    try {
      await deleteDecision(decision.id);
      toast.success("Decision deleted");
      window.location.href = "/decisions";
    } catch {
      toast.error("Failed to delete decision");
      setIsDeleting(false);
    }
  };

  const handlePrLinked = (prLink: { id: string; prNumber: number; prTitle: string; prUrl: string; prState: string; createdAt: string }) => {
    setDecision(prev => ({
      ...prev,
      prLinks: [...prev.prLinks, prLink]
    }));
  };

  const handleCommentAdded = (comment: ApiComment) => {
    setDecision(prev => ({
      ...prev,
      comments: [...prev.comments, comment as ApiComment],
      commentCount: prev.commentCount + 1
    }));
  };

  // Check if current user is the author (simplified - in production, compare with auth state)
  const isAuthor = true;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/decisions"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to decisions
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={decision.status} />
            <div className="flex gap-2">
              {decision.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <VoteButtons 
            decisionId={decision.id} 
            score={decision.voteScore} 
            userVote={decision.userVote}
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{decision.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={decision.authorAvatar || '/default-avatar.png'}
              alt={decision.authorName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{decision.authorName}</p>
              <p className="text-sm text-gray-500">
                authored {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href={`/repos/${decision.repoId}`}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {decision.repoName}
            </Link>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{decision.viewCount} views</span>
            </div>
          </div>
        </div>

        {/* Action buttons for author */}
        {isAuthor && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
            <Link
              href={`/decisions/${decision.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <TiptapEditor
          content={decision.body}
          onChange={() => {}}
          editable={false}
        />
      </div>

      {/* PR Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Linked Pull Requests
          </h2>
          <button
            onClick={() => setIsPrModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Link PR
          </button>
        </div>

        {decision.prLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No pull requests linked yet.</p>
        ) : (
          <div className="space-y-3">
            {decision.prLinks.map((pr) => {
              const config = statusConfig[pr.prState as keyof typeof statusConfig] || statusConfig.open;
              return (
                <a
                  key={pr.id}
                  href={pr.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                    <span className="font-medium">#{pr.prNumber}</span>
                    <span className="text-gray-600">{pr.prTitle}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* References */}
      {(decision.references.length > 0 || decision.referencedBy.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">References</h2>
          
          {decision.references.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">This decision references:</h3>
              <div className="space-y-2">
                {decision.references.map((ref) => (
                  <Link
                    key={ref.id}
                    href={`/decisions/${ref.targetId}`}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <StatusBadge status={ref.targetStatus} />
                    <span className="font-medium">{ref.targetTitle}</span>
                    {ref.description && (
                      <span className="text-gray-500 text-sm">- {ref.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {decision.referencedBy.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Referenced by:</h3>
              <div className="space-y-2">
                {decision.referencedBy.map((ref) => (
                  <Link
                    key={ref.id}
                    href={`/decisions/${ref.targetId}`}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <StatusBadge status={ref.targetStatus} />
                    <span className="font-medium">{ref.targetTitle}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          Comments ({decision.commentCount})
        </h2>
        
        <CommentThread
          comments={decision.comments}
          decisionId={decision.id}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {/* PR Link Modal */}
      {isPrModalOpen && (
        <PrLinkModal
          decisionId={decision.id}
          repoFullName={decision.repoFullName}
          onClose={() => setIsPrModalOpen(false)}
          onLinked={handlePrLinked}
        />
      )}
    </div>
  );
}
