// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import ToastObserver from "@/components/ToastObserver";

export const metadata: Metadata = {
  title: "MindRepo — GitHub for thinking, not just code",
  description:
    "Version-control your architectural decisions alongside your code. Track the why, not just the what.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Toaster position="top-right" />
        <ToastObserver />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
