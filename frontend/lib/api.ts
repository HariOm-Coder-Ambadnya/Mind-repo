// lib/api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getClientToken, clearClientToken } from "./auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  githubUsername: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export type DecisionStatus = 'PROPOSED' | 'ACCEPTED' | 'SUPERSEDED' | 'DEPRECATED';

export interface Decision {
  id: string;
  title: string;
  body: string;
  status: DecisionStatus;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorGithubUsername: string;
  repoId: string;
  repoName: string;
  repoFullName: string;
  prLinks: PrLink[];
  commentCount: number;
  voteScore: number;
  userVote: number | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface DecisionDetail extends Decision {
  comments: Comment[];
  references: DecisionRef[];
  referencedBy: DecisionRef[];
}

export interface Comment {
  id: string;
  body: string;
  resolved: boolean;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  parentId: string | null;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface DecisionRef {
  id: string;
  description: string;
  targetId: string;
  targetTitle: string;
  targetStatus: DecisionStatus;
}

export interface PrLink {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prState: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface OrgDetail extends OrgSummary {
  members: OrgMember[];
}

export interface OrgMember {
  userId: string;
  githubUsername: string;
  name: string | null;
  avatarUrl: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface CreateDecisionData {
  title: string;
  body: string;
  repoId: string;
  status?: DecisionStatus;
  tags?: string[];
}

export interface UpdateDecisionData {
  title?: string;
  body?: string;
  status?: DecisionStatus;
  tags?: string[];
}

export interface CreateOrgInput {
  name: string;
  slug: string;
  description?: string;
}

export interface DecisionSearchParams {
  repoId?: string;
  status?: DecisionStatus;
  search?: string;
  tags?: string[];
  authorId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AddPrLinkData {
  prNumber: number;
  prRepoFullName: string;
}

export interface AddCommentData {
  body: string;
  parentId?: string;
}

export interface Repo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  defaultBranch: string;
  orgId: string;
  orgName: string;
  createdAt: string;
}

export interface GitHubRepoDTO {
  githubRepoId: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  defaultBranch: string;
  alreadyImported: boolean;
}

export interface RepoResponse {
  id: string;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  defaultBranch: string;
  orgId: string;
  orgName: string;
  createdAt: string;
}

// ── Axios instance ────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getClientToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, clear token and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearClientToken();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ── Typed API functions ───────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const res: AxiosResponse<ApiResponse<User>> = await apiClient.get("/api/auth/me");
  return res.data.data;
}

export async function getDecisions(params: DecisionSearchParams): Promise<PagedResponse<Decision>> {
  const res: AxiosResponse<ApiResponse<PagedResponse<Decision>>> = await apiClient.get(
    "/api/decisions",
    { params }
  );
  return res.data.data;
}

export async function getDecision(id: string): Promise<DecisionDetail> {
  const res: AxiosResponse<ApiResponse<DecisionDetail>> = await apiClient.get(
    `/api/decisions/${id}`
  );
  return res.data.data;
}

export async function createDecision(data: CreateDecisionData): Promise<Decision> {
  const res: AxiosResponse<ApiResponse<Decision>> = await apiClient.post(
    "/api/decisions",
    data
  );
  return res.data.data;
}

export async function updateDecision(
  id: string,
  data: UpdateDecisionData
): Promise<Decision> {
  const res: AxiosResponse<ApiResponse<Decision>> = await apiClient.patch(
    `/api/decisions/${id}`,
    data
  );
  return res.data.data;
}

export async function deleteDecision(id: string): Promise<void> {
  await apiClient.delete(`/api/decisions/${id}`);
}

export async function addPrLink(decisionId: string, data: AddPrLinkData): Promise<PrLink> {
  const res: AxiosResponse<ApiResponse<PrLink>> = await apiClient.post(
    `/api/decisions/${decisionId}/pr-links`,
    data
  );
  return res.data.data;
}

export async function removePrLink(decisionId: string, linkId: string): Promise<void> {
  await apiClient.delete(`/api/decisions/${decisionId}/pr-links/${linkId}`);
}

export async function addComment(decisionId: string, data: AddCommentData): Promise<Comment> {
  const res: AxiosResponse<ApiResponse<Comment>> = await apiClient.post(
    `/api/decisions/${decisionId}/comments`,
    data
  );
  return res.data.data;
}

export async function resolveComment(decisionId: string, commentId: string): Promise<Comment> {
  const res: AxiosResponse<ApiResponse<Comment>> = await apiClient.patch(
    `/api/decisions/${decisionId}/comments/${commentId}/resolve`
  );
  return res.data.data;
}

export async function vote(decisionId: string, vote: -1 | 0 | 1): Promise<{newScore: number, userVote: number}> {
  const res: AxiosResponse<ApiResponse<{newScore: number, userVote: number}>> = await apiClient.post(
    `/api/decisions/${decisionId}/vote`,
    { vote }
  );
  return res.data.data;
}

export async function getOrgs(): Promise<OrgSummary[]> {
  const res: AxiosResponse<ApiResponse<OrgSummary[]>> = await apiClient.get("/api/orgs");
  return res.data.data;
}

export async function getOrg(slug: string): Promise<OrgDetail> {
  const res: AxiosResponse<ApiResponse<OrgDetail>> = await apiClient.get(`/api/orgs/${slug}`);
  return res.data.data;
}

export async function createOrg(data: CreateOrgInput): Promise<OrgDetail> {
  const res: AxiosResponse<ApiResponse<OrgDetail>> = await apiClient.post("/api/orgs", data);
  return res.data.data;
}

export async function getRepos(): Promise<Repo[]> {
  const res: AxiosResponse<ApiResponse<Repo[]>> = await apiClient.get("/api/repos");
  return res.data.data;
}

export async function getAvailableGithubRepos(): Promise<GitHubRepoDTO[]> {
  const res: AxiosResponse<ApiResponse<GitHubRepoDTO[]>> = await apiClient.get(
    "/api/repos/github/available"
  );
  return res.data.data;
}

export async function importRepo(githubRepoId: number, orgId: string): Promise<RepoResponse> {
  const res: AxiosResponse<ApiResponse<RepoResponse>> = await apiClient.post(
    "/api/repos/import",
    { githubRepoId, orgId }
  );
  return res.data.data;
}

export default apiClient;
