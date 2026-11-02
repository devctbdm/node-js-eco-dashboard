"use client"; // Error boundaries must be Client Components

import { LayoutDashboard, RotateCw, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // Next.js adds a `digest` to server errors; useful for support and log lookup
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        role="alert"
        className="relative flex w-full max-w-md flex-col items-center text-center"
      >
        <motion.div
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="flex size-14 items-center justify-center rounded-full border bg-card text-destructive shadow-xs"
        >
          <TriangleAlert className="size-6" aria-hidden />
        </motion.div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          We couldn’t load this page. Your data is safe. Try again, and if the
          problem continues, contact support with the reference below.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={() => retry()}>
            <RotateCw /> Try again
          </Button>
          {/* Base UI: `render` instead of Radix `asChild` */}
          <Button
            variant="outline"
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            <LayoutDashboard /> Back to dashboard
          </Button>
        </div>

        {digest && (
          <p className="mt-8 rounded-md border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            Error reference:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {digest}
            </span>
          </p>
        )}
      </motion.div>
    </main>
  );
}
