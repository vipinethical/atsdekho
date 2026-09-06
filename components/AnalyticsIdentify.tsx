"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { identifySignedIn, resetAnalytics } from "@/lib/analytics";

export function AnalyticsIdentify() {
  const { data, status } = useSession();
  const identified = useRef(false);
  const email = data?.user?.email?.trim().toLowerCase() ?? "";

  useEffect(() => {
    if (status === "loading") return;
    if (email) {
      identified.current = true;
      void identifySignedIn(email);
      return;
    }
    if (identified.current) {
      identified.current = false;
      resetAnalytics();
    }
  }, [status, email]);

  return null;
}
