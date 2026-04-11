// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GitBranch,
  Building2,
  Activity,
  FileText,
  ArrowRight,
  Plus,
  Github,
  FolderPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react";
import { Decision, DecisionStatus, RepoResponse } from "@/lib/api";
import ConnectRepoModal from "@/components/repos/ConnectRepoModal";

interface UserProfile {
  id: string;
  githubUsername: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

interface DashboardClientProps {
  user: UserProfile;
  initialDecisions: Decision[];
  hasRepos: boolean;
}

export default function DashboardClient({
  user,
  initialDecisions,
  hasRepos,
}: DashboardClientProps) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [recentDecisions, setRecentDecisions] = useState<Decision[]>(initialDecisions);

  const handleRepoConnected = useCallback((repo: RepoResponse) => {
    // Could refresh the page or update state
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <section className="mb-10 flex items-center gap-5">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.githubUsername}
              width={64}
              height={64}
              className="rounded-full ring-4 ring-white shadow-md"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-4 ring-white shadow-md">
              {user.githubUsername.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back,{" "}
              <span className="text-brand-600">
                {user.name ?? user.githubUsername}
              </span>{" "}
              👋
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              @{user.githubUsername}
              {user.email && (
                <span className="ml-3 text-slate-400">{user.email}</span>
              )}
            </p>
          </div>
        </section>

        {/* Recent Decisions Section */}
        {recentDecisions.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Recent Decisions</h2>
              <div className="flex gap-3">
                <Link
                  href="/decisions/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Decision
                </Link>
                <Link
                  href="/decisions"
                  className="inline-flex items-center gap-2 px-4 py-2 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDecisions.map((decision) => (
                <DecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </section>
        )}

        {/* Empty-state cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Decisions */}
          {hasRepos ? (
            <EmptyCard
              icon={<FileText className="h-8 w-8 text-brand-500" />}
              title="Your Decisions"
              description="Architectural decisions you've authored or contributed to will appear here."
              cta="Create your first decision"
              bgColor="bg-brand-50"
              borderColor="border-brand-100"
              href="/decisions/new"
            />
          ) : (
            <EmptyCardWithAction
              icon={<FileText className="h-8 w-8 text-brand-500" />}
              title="Your Decisions"
              description="Connect a repository first to start creating architectural decisions."
              cta="Connect a repo first"
              bgColor="bg-brand-50"
              borderColor="border-brand-100"
              onAction={() => setIsConnectModalOpen(true)}
            />
          )}

          {/* Orgs */}
          <EmptyCardWithAction
            icon={<Building2 className="h-8 w-8 text-purple-500" />}
            title="Your Organizations"
            description="Connect GitHub repositories or create new organizations."
            primaryCta="Connect GitHub Repo"
            secondaryCta="Create organization"
            bgColor="bg-purple-50"
            borderColor="border-purple-100"
            onPrimaryAction={() => setIsConnectModalOpen(true)}
            onSecondaryAction={() => (window.location.href = "/orgs/new")}
          />

          {/* Activity */}
          <EmptyCard
            icon={<Activity className="h-8 w-8 text-emerald-500" />}
            title="Recent Activity"
            description="Decisions created, updated, and linked to pull requests across your orgs."
            cta="Invite teammates"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
            href="/activity"
          />
        </div>

        {/* Quick-start banner */}
        <section className="mt-10 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                <GitBranch className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Get started with MindRepo
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {hasRepos
                    ? "Create your first architectural decision to document your choices."
                    : "Connect a GitHub repository to start logging architectural decisions."}
                </p>
              </div>
            </div>
            {hasRepos ? (
              <Link
                href="/decisions/new"
                className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Quick start →
              </Link>
            ) : (
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <Github className="h-4 w-4" />
                Connect GitHub Repo
              </button>
            )}
          </div>
        </section>
      </main>

      <ConnectRepoModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={handleRepoConnected}
      />
    </div>
  );
}

// ── Decision Card ───────────────────────────────────────────────────────────

function DecisionCard({ decision }: { decision: Decision }) {
  const statusConfig = {
    PROPOSED: { bg: "bg-blue-100", text: "text-blue-800", label: "Proposed" },
    ACCEPTED: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
    SUPERSEDED: { bg: "bg-amber-100", text: "text-amber-800", label: "Superseded" },
    DEPRECATED: { bg: "bg-red-100", text: "text-red-800", label: "Deprecated" },
  };

  const config = statusConfig[decision.status];

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      {/* Status badge */}
      <div className="mb-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {decision.title}
      </h3>

      {/* Author row */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <img
          src={decision.authorAvatar || "/default-avatar.png"}
          alt={decision.authorName}
          className="w-6 h-6 rounded-full"
        />
        <span>{decision.authorName}</span>
        <span className="text-gray-400">•</span>
        <span>
          {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
            {decision.repoName}
          </span>
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

// ── Sub-components ───────────────────────────────────────────────────────────

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  bgColor: string;
  borderColor: string;
  href: string;
}

function EmptyCard({
  icon,
  title,
  description,
  cta,
  bgColor,
  borderColor,
  href,
}: EmptyCardProps) {
  return (
    <div
      className={`flex flex-col rounded-2xl border ${borderColor} ${bgColor} p-6 shadow-sm`}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      <Link
        href={href}
        className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {cta}
      </Link>
    </div>
  );
}

interface EmptyCardWithActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: string;
  primaryCta?: string;
  secondaryCta?: string;
  bgColor: string;
  borderColor: string;
  onAction?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

function EmptyCardWithAction({
  icon,
  title,
  description,
  cta,
  primaryCta,
  secondaryCta,
  bgColor,
  borderColor,
  onAction,
  onPrimaryAction,
  onSecondaryAction,
}: EmptyCardWithActionProps) {
  // Simple single-button version
  if (cta && onAction) {
    return (
      <div
        className={`flex flex-col rounded-2xl border ${borderColor} ${bgColor} p-6 shadow-sm`}
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
          {icon}
        </div>
        <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <button
          onClick={onAction}
          className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {cta}
        </button>
      </div>
    );
  }

  // Two-button version
  return (
    <div
      className={`flex flex-col rounded-2xl border ${borderColor} ${bgColor} p-6 shadow-sm`}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      <div className="flex flex-col gap-2">
        {primaryCta && onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Github className="h-4 w-4" />
            {primaryCta}
          </button>
        )}
        {secondaryCta && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <FolderPlus className="h-4 w-4" />
            {secondaryCta}
          </button>
        )}
      </div>
    </div>
  );
}
