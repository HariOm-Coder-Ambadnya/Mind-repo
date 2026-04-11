// components/repos/ConnectRepoModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2, GitBranch, Lock, Globe, Check } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAvailableGithubRepos,
  importRepo,
  getOrgs,
  GitHubRepoDTO,
  OrgSummary,
  RepoResponse,
} from "@/lib/api";

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (repo: RepoResponse) => void;
  preselectedOrgId?: string;
}

export default function ConnectRepoModal({
  isOpen,
  onClose,
  onConnected,
  preselectedOrgId,
}: ConnectRepoModalProps) {
  const [repos, setRepos] = useState<GitHubRepoDTO[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepoDTO[]>([]);
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoDTO | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(preselectedOrgId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reposData, orgsData] = await Promise.all([
        getAvailableGithubRepos(),
        getOrgs(),
      ]);
      setRepos(reposData);
      setFilteredRepos(reposData);
      setOrgs(orgsData);
      // Auto-select first org if none preselected
      if (!preselectedOrgId && orgsData.length > 0) {
        setSelectedOrgId(orgsData[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load GitHub repositories";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [preselectedOrgId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRepos(repos);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRepos(
        repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(query) ||
            repo.fullName.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, repos]);

  const handleConnect = async () => {
    if (!selectedRepo || !selectedOrgId) {
      toast.error("Please select a repository and organization");
      return;
    }

    setIsConnecting(true);
    try {
      const importedRepo = await importRepo(selectedRepo.githubRepoId, selectedOrgId);
      toast.success(`Repository "${importedRepo.fullName}" connected!`);
      onConnected(importedRepo);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect repository";
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRepoSelect = (repo: GitHubRepoDTO) => {
    if (repo.alreadyImported) return;
    setSelectedRepo(repo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Connect a GitHub Repository</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-gray-600">Loading your GitHub repositories...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Organization selector */}
              {!preselectedOrgId && orgs.length > 0 && (
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Repo list */}
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
                {filteredRepos.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    {searchQuery
                      ? "No repositories match your search"
                      : "No repositories found"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo.githubRepoId}
                        onClick={() => handleRepoSelect(repo)}
                        className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors ${
                          repo.alreadyImported
                            ? "cursor-not-allowed bg-gray-50"
                            : selectedRepo?.githubRepoId === repo.githubRepoId
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              repo.alreadyImported
                                ? "border-gray-300 bg-gray-100"
                                : selectedRepo?.githubRepoId === repo.githubRepoId
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                            }`}
                          >
                            {selectedRepo?.githubRepoId === repo.githubRepoId && !repo.alreadyImported && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                repo.alreadyImported ? "text-gray-400" : "text-gray-900"
                              }`}
                            >
                              {repo.name}
                            </p>
                            <p
                              className={`text-sm ${
                                repo.alreadyImported ? "text-gray-300" : "text-gray-500"
                              }`}
                            >
                              {repo.fullName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {repo.isPrivate ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Globe className="h-4 w-4 text-gray-400" />
                          )}
                          {repo.alreadyImported && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                              Already imported
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected repo info */}
              {selectedRepo && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    Selected: <span className="font-medium">{selectedRepo.fullName}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!selectedRepo || !selectedOrgId || isConnecting || selectedRepo?.alreadyImported}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GitBranch className="h-4 w-4" />
                Connect selected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
