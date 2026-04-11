// app/decisions/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import DecisionListClient from "./DecisionListClient";
import { ApiResponse, Decision, PagedResponse } from "@/lib/api";

interface DecisionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function fetchDecisions(
  token: string,
  searchParams: DecisionsPageProps["searchParams"]
): Promise<PagedResponse<Decision>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  
  const params = new URLSearchParams();
  if (searchParams.search) params.set("search", String(searchParams.search));
  if (searchParams.status) params.set("status", String(searchParams.status));
  if (searchParams.page) params.set("page", String(searchParams.page));
  if (searchParams.sort) params.set("sort", String(searchParams.sort));
  
  try {
    const res = await fetch(`${apiUrl}/api/decisions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error("Failed to fetch decisions");
    
    const json: ApiResponse<PagedResponse<Decision>> = await res.json();
    return json.data;
  } catch {
    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  }
}

export default async function DecisionsPage({ searchParams }: DecisionsPageProps) {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/");
  }

  const decisionsData = await fetchDecisions(token, searchParams);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DecisionListClient 
          initialData={decisionsData}
          initialSearch={typeof searchParams.search === "string" ? searchParams.search : ""}
          initialStatus={typeof searchParams.status === "string" ? searchParams.status : "all"}
          initialSort={typeof searchParams.sort === "string" ? searchParams.sort : "createdAt,desc"}
        />
      </main>
    </div>
  );
}
