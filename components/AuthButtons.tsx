"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { capture } from "@/lib/analytics";

export function AuthButtons() {
  const { data, status } = useSession();
  if (status === "loading") {
    return <span className="text-sm text-muted">…</span>;
  }
  if (data?.user?.email) {
    return (
      <span className="flex items-center gap-3">
        <span className="hidden max-w-[10rem] truncate text-sm text-muted sm:inline">{data.user.email}</span>
        <button
          type="button"
          onClick={() => {
            capture("google_signout_clicked");
            void signOut();
          }}
          className="text-sm text-muted hover:text-ink"
        >
          Sign out
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        capture("google_signin_clicked");
        void signIn("google", { callbackUrl: "/scan?plan=monthly" });
      }}
      className="text-sm text-muted hover:text-ink"
    >
      Sign in with Google
    </button>
  );
}
