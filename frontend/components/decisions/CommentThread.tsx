// components/decisions/CommentThread.tsx
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Check, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Comment, addComment, resolveComment } from '@/lib/api';

interface CommentThreadProps {
  comments: Comment[];
  decisionId: string;
  onCommentAdded: (comment: Comment) => void;
}

interface CommentItemProps {
  comment: Comment;
  decisionId: string;
  onReply: (comment: Comment) => void;
  onResolve: (commentId: string) => void;
  depth: number;
}

function CommentItem({ comment, decisionId, onReply, onResolve, depth }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(!comment.resolved);

  const handleReply = async () => {
    if (!replyBody.trim()) return;

    setIsSubmitting(true);
    try {
      const reply = await addComment(decisionId, {
        body: replyBody,
        parentId: comment.id,
      });
      onReply(reply);
      setReplyBody('');
      setIsReplying(false);
      toast.success('Reply added!');
    } catch {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveComment(decisionId, comment.id);
      onResolve(comment.id);
      toast.success('Comment resolved!');
    } catch {
      toast.error('Failed to resolve comment');
    }
  };

  // Only render two levels deep
  const canShowReplies = depth < 2;

  if (comment.resolved && !showResolved) {
    return (
      <div className="py-2">
        <button
          onClick={() => setShowResolved(true)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronDown className="h-4 w-4" />
          <span>Show resolved comment</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Resolved</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`p-4 rounded-lg ${comment.resolved ? 'bg-gray-50 opacity-75' : 'bg-white border border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={comment.authorAvatar || '/default-avatar.png'}
              alt={comment.authorName}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium text-sm">{comment.authorName}</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.resolved && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                Resolved
              </span>
            )}
          </div>

          {/* Resolve button (only for top-level comments) */}
          {depth === 0 && !comment.resolved && (
            <button
              onClick={handleResolve}
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
            >
              <Check className="h-4 w-4" />
              Resolve
            </button>
          )}
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none mb-3">
          <p>{comment.body}</p>
        </div>

        {/* Actions */}
        {!comment.resolved && canShowReplies && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        )}

        {/* Reply input */}
        {isReplying && (
          <div className="mt-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              minLength={80}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsReplying(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyBody.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {canShowReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              decisionId={decisionId}
              onReply={onReply}
              onResolve={onResolve}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({ comments, decisionId, onCommentAdded }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(decisionId, { body: newComment });
      onCommentAdded(comment);
      setNewComment('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            decisionId={decisionId}
            onReply={onCommentAdded}
            onResolve={(commentId) => {
              // Refresh comments after resolve
            }}
            depth={0}
          />
        ))}
      </div>

      {/* New comment form */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Add a comment
        </h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
