"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

export function SignOutButton({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Sign out could not be completed.");
      }
      router.replace(admin ? "/adminlogin" : "/login");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Sign out could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button variant="outline" onClick={signOut} disabled={busy}>
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
