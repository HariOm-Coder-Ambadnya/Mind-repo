// app/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, GitMerge, Search, Shield } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/components/AuthProvider";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 font-bold">
          <GitBranch className="h-6 w-6 text-brand-400" />
          <span className="text-xl tracking-tight text-white">MindRepo</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          GitHub →
        </a>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300">
          Now in early access
        </span>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          GitHub stores your{" "}
          <span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
            code.
          </span>
          <br />
          MindRepo stores your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-brand-400 bg-clip-text text-transparent">
            mind.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
          Version-control your architectural decisions alongside your code.
          Track the <em>why</em>, not just the <em>what</em>. Never lose
          context again.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <LoginButton className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-2xl shadow-white/10 transition-all hover:bg-slate-100 hover:shadow-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-slate-900" />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Free for open source. No credit card required.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3 sm:px-10">
        {[
          {
            icon: <GitMerge className="h-6 w-6 text-brand-400" />,
            title: "Link to Pull Requests",
            desc: "Connect every decision to the PR that implemented it. Trace context forward and backward in time.",
          },
          {
            icon: <Search className="h-6 w-6 text-purple-400" />,
            title: "Full-text Search",
            desc: "Find any decision by title, tag, or keyword. Powered by PostgreSQL full-text search — fast and reliable.",
          },
          {
            icon: <Shield className="h-6 w-6 text-emerald-400" />,
            title: "Org-level Access Control",
            desc: "Decisions live inside repos, repos inside orgs. Role-based access keeps sensitive context private.",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm"
          >
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700/60">
              {icon}
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} MindRepo. Built for developers who care about context.
      </footer>
    </main>
  );
}
