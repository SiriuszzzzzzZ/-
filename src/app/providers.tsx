"use client";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "@/components/ui";
import { ScrollRestore } from "@/components/ui/ScrollRestore";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        <ToastProvider>
          <ScrollRestore />
          {children}
        </ToastProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
}
