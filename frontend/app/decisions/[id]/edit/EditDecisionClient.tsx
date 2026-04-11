// app/decisions/[id]/edit/EditDecisionClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { updateDecision, DecisionDetail, DecisionStatus } from "@/lib/api";
import TagInput from "@/components/decisions/TagInput";
import StatusBadge from "@/components/decisions/StatusBadge";

function SimpleEditor({ content, onChange, placeholder }: { content: string; onChange: (json: string) => void; placeholder?: string }) {
  // Parse JSON content and extract text
  let initialText = "";
  try {
    const parsed = JSON.parse(content);
    if (parsed.content && parsed.content[0]?.content?.[0]?.text) {
      initialText = parsed.content[0].content[0].text;
    }
  } catch {
    initialText = content;
  }
  
  const [text, setText] = useState(initialText);
  
  return (
    <textarea
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(JSON.stringify({ 
          type: "doc", 
          content: [{ type: "paragraph", content: [{ type: "text", text: e.target.value }] }] 
        }));
      }}
      placeholder={placeholder}
      className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
    />
  );
}

interface EditDecisionClientProps {
  decision: DecisionDetail;
}

export default function EditDecisionClient({ decision: initialDecision }: EditDecisionClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(initialDecision.title);
  const [body, setBody] = useState(initialDecision.body);
  const [status, setStatus] = useState<DecisionStatus>(initialDecision.status);
  const [tags, setTags] = useState<string[]>(initialDecision.tags);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Body is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDecision(initialDecision.id, {
        title: title.trim(),
        body,
        status,
        tags,
      });
      
      toast.success("Decision updated successfully!");
      router.push(`/decisions/${initialDecision.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleChars = title.length;
  const maxTitleChars = 500;

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/decisions/${initialDecision.id}`}
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to decision
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Decision</h1>
          <div className="text-sm text-gray-500">
            Last updated {formatDistanceToNow(new Date(initialDecision.updatedAt), { addSuffix: true })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={maxTitleChars}
              placeholder="Enter decision title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-sm ${titleChars > maxTitleChars * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                {titleChars} / {maxTitleChars}
              </span>
            </div>
          </div>

          {/* Current status display */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Current status:</span>
            <StatusBadge status={initialDecision.status} />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DecisionStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROPOSED">Proposed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="SUPERSEDED">Superseded</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <SimpleEditor
              content={body}
              onChange={setBody}
              placeholder="Describe your architectural decision..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Link
              href={`/decisions/${initialDecision.id}`}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
