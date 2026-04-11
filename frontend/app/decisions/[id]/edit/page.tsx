// app/decisions/[id]/edit/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { TOKEN_COOKIE } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import EditDecisionClient from "./EditDecisionClient";
import { ApiResponse, DecisionDetail } from "@/lib/api";

interface EditDecisionPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: EditDecisionPageProps): Promise<Metadata> {
  return {
    title: "Edit Decision | MindRepo",
  };
}

async function fetchDecision(id: string, token: string): Promise<DecisionDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  
  try {
    const res = await fetch(`${apiUrl}/api/decisions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error("Failed to fetch decision");
    
    const json: ApiResponse<DecisionDetail> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function EditDecisionPage({ params }: EditDecisionPageProps) {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/");
  }

  const decision = await fetchDecision(params.id, token);

  if (!decision) {
    redirect("/decisions");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EditDecisionClient decision={decision} />
      </main>
    </div>
  );
}
