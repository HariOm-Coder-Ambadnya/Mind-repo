// app/decisions/DecisionListClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { Decision, DecisionStatus, PagedResponse, getDecisions } from "@/lib/api";
import DecisionCard from "@/components/decisions/DecisionCard";
import SkeletonCard from "@/components/ui/SkeletonCard";

interface DecisionListClientProps {
  initialData: PagedResponse<Decision>;
  initialSearch: string;
  initialStatus: string;
  initialSort: string;
}

const statusTabs = [
  { value: "all", label: "All" },
  { value: "PROPOSED", label: "Proposed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "SUPERSEDED", label: "Superseded" },
  { value: "DEPRECATED", label: "Deprecated" },
];

const sortOptions = [
  { value: "createdAt,desc", label: "Newest" },
  { value: "createdAt,asc", label: "Oldest" },
  { value: "viewCount,desc", label: "Most viewed" },
  { value: "comments.size,desc", label: "Most discussed" },
];

export default function DecisionListClient({
  initialData,
  initialSearch,
  initialStatus,
  initialSort,
}: DecisionListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [decisions, setDecisions] = useState<Decision[]>(initialData.content);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: initialData.page,
    size: initialData.size,
    totalElements: initialData.totalElements,
    totalPages: initialData.totalPages,
    last: initialData.last,
  });

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);

  const [debouncedSearch] = useDebounce(search, 300);

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status !== "all") params.set("status", status);
      params.set("sort", sort);
      params.set("page", String(pagination.page));

      // Update URL
      const newUrl = `/decisions?${params.toString()}`;
      router.push(newUrl, { scroll: false });

      const data = await getDecisions({
        search: debouncedSearch || undefined,
        status: status !== "all" ? (status as DecisionStatus) : undefined,
        sort,
        page: pagination.page,
        size: 20,
      });

      setDecisions(data.content);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        last: data.last,
      });
    } catch {
      toast.error("Failed to fetch decisions");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, sort, pagination.page, router]);

  useEffect(() => {
    fetchDecisions();
  }, [debouncedSearch, status, sort, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Decisions</h1>
        <Link
          href="/decisions/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Decision
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decisions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                status === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : decisions.length === 0 ? (
          // Empty state
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "No decisions found" : "No decisions yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? "Try adjusting your search or filters"
                : "Create your first decision to get started"}
            </p>
            {!search && (
              <Link
                href="/decisions/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create first decision
              </Link>
            )}
          </div>
        ) : (
          // Decision list
          decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} showRepo />
          ))
        )}
      </div>

      {/* Pagination */}
      {decisions.length > 0 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-gray-600">
            Showing {decisions.length} of {pagination.totalElements} decisions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0 || isLoading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.last || isLoading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
