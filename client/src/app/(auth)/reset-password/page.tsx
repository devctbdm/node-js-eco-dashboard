"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is invalid or expired.");
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setError("Use a password between 12 and 128 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many attempts. Please wait and try again."
            : "This reset link is invalid or expired.",
        );
        return;
      }
      router.replace("/login?reset=true");
    } catch {
      setError("Can’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password must be between 12 and 128 characters.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmation">Confirm password</Label>
          <Input
            id="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy || !token}>
          {busy ? "Updating password…" : "Update password"}
        </Button>
        <Link href="/login" className="text-center text-sm underline">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading reset form…
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
