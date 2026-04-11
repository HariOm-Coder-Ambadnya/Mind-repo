// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Decision } from "@/lib/api";
import DashboardClient from "./DashboardClient";

interface UserProfile {
  id: string;
  githubUsername: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

async function fetchCurrentUser(token: string): Promise<UserProfile | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<UserProfile> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function fetchRecentDecisions(token: string): Promise<Decision[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}/api/decisions?page=0&size=5&sort=createdAt,desc`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json: ApiResponse<{ content: Decision[] }> = await res.json();
    return json.data.content.slice(0, 5);
  } catch {
    return [];
  }
}

async function fetchRepos(token: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${apiUrl}/api/repos`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json: ApiResponse<unknown[]> = await res.json();
    return json.data.length > 0;
  } catch {
    return false;
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/");
  }

  const user = await fetchCurrentUser(token);
  if (!user) {
    redirect("/");
  }

  const [recentDecisions, hasRepos] = await Promise.all([
    fetchRecentDecisions(token),
    fetchRepos(token),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <DashboardClient
        user={user}
        initialDecisions={recentDecisions}
        hasRepos={hasRepos}
      />
    </div>
  );
}
