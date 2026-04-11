// app/decisions/new/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { TOKEN_COOKIE } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import NewDecisionClient from "./NewDecisionClient";

export const metadata: Metadata = {
  title: "New Decision | MindRepo",
  description: "Create a new architectural decision record",
};

export default async function NewDecisionPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <NewDecisionClient />
      </main>
    </div>
  );
}
