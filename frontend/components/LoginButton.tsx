// components/LoginButton.tsx
"use client";

import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/github`;
  };

  return (
    <button
      onClick={handleLogin}
      className={
        className ??
        "inline-flex items-center gap-3 rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-700 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      }
    >
      {/* GitHub SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.12 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.48 5.922.43.372.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.293 0 .321.217.695.825.577C20.565 21.797 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
      Continue with GitHub
    </button>
  );
}
