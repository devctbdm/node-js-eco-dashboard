"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

function VerifyEmailForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = React.useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const started = React.useRef(false);

  const verify = React.useCallback(async (showLoading = true) => {
    if (!token) {
      setState("error");
      return;
    }
    if (showLoading) setState("loading");
    window.history.replaceState(null, "", "/verify-email");
    try {
      const response = await fetch(`${API_URL}/auth/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(response.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }, [token]);

  React.useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    void verify(false);
  }, [token, verify]);

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <section className="flex w-full max-w-sm flex-col items-center gap-5 rounded-xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Email verification</h1>
        <p role="status" className="text-sm text-muted-foreground">
          {state === "loading" && "Verifying your email address…"}
          {state === "success" && "Your email address is verified."}
          {state === "error" &&
            "This verification link is invalid, expired, or could not be reached."}
        </p>
        {state === "error" && token && (
          <Button onClick={() => void verify()}>Try again</Button>
        )}
        {state === "success" && (
          <Link href="/login" className="text-sm underline">
            Continue to sign in
          </Link>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading verification…
          </div>
        </main>
      }
    >
      <VerifyEmailForm />
    </React.Suspense>
  );
}
