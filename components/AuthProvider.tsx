"use client";

import { SessionProvider } from "next-auth/react";
import { AnalyticsIdentify } from "@/components/AnalyticsIdentify";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsIdentify />
      {children}
    </SessionProvider>
  );
}
