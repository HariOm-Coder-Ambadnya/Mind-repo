// components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import { LogOut, GitBranch } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-slate-900 hover:text-brand-600 transition-colors"
        >
          <GitBranch className="h-5 w-5 text-brand-600" />
          <span className="text-lg tracking-tight">MindRepo</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.githubUsername}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {user.githubUsername.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {user.githubUsername}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
