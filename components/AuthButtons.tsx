"use client";

import { signIn, signOut, useSession } from "next-auth/react";

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
          onClick={() => void signOut()}
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
      onClick={() => void signIn("google", { callbackUrl: "/scan?plan=monthly" })}
      className="text-sm text-muted hover:text-ink"
    >
      Sign in with Google
    </button>
  );
}
