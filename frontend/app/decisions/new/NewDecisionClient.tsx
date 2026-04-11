// app/decisions/new/NewDecisionClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  createDecision,
  DecisionStatus,
  getRepos,
  Repo,
  Decision,
  RepoResponse,
} from "@/lib/api";
import TagInput from "@/components/decisions/TagInput";
import ConnectRepoModal from "@/components/repos/ConnectRepoModal";

// Simple text editor since Tiptap might have SSR issues
function SimpleEditor({ content, onChange, placeholder }: { content: string; onChange: (json: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: e.target.value }] }] }))}
      placeholder={placeholder}
      className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
    />
  );
}

export default function NewDecisionClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<DecisionStatus>("PROPOSED");
  const [tags, setTags] = useState<string[]>([]);
  const [repoId, setRepoId] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);

  const fetchRepos = useCallback(async () => {
    try {
      const data = await getRepos();
      setRepos(data);
    } catch {
      toast.error("Failed to load repositories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleRepoConnected = useCallback(
    (importedRepo: RepoResponse) => {
      // Refresh repos list
      fetchRepos();
      // Auto-select the newly added repo
      setRepoId(importedRepo.id);
      toast.success(`Repository "${importedRepo.fullName}" connected and selected!`);
    },
    [fetchRepos]
  );

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
    if (!repoId) {
      toast.error("Please select a repository");
      return;
    }

    setIsSubmitting(true);
    try {
      const decision = await createDecision({
        title: title.trim(),
        body: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: body }] }] }),
        repoId,
        status,
        tags,
      });
      
      toast.success("Decision created successfully!");
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleChars = title.length;
  const maxTitleChars = 500;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Decision</h1>

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

          {/* Repository */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository <span className="text-red-500">*</span>
            </label>
            <select
              value={repoId}
              onChange={(e) => setRepoId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={repos.length === 0}
            >
              <option value="">
                {repos.length === 0 ? "No repositories available" : "Select a repository"}
              </option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.fullName}
                </option>
              ))}
            </select>
            {repos.length === 0 ? (
              <div className="mt-2 rounded-lg bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  No repositories connected yet. Connect a GitHub repository to get started.
                </p>
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  Connect GitHub Repository
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Github className="h-4 w-4" />
                Connect another repository
              </button>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
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
              href="/decisions"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !body.trim() || !repoId}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Decision"}
            </button>
          </div>
        </form>
      </div>

      <ConnectRepoModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={handleRepoConnected}
      />
    </div>
  );
}
