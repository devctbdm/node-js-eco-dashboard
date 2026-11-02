"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16">
      {/* soft grid backdrop, fades out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex w-full max-w-xl flex-col items-center text-center"
      >
        <div
          aria-hidden
          className="select-none text-[8rem] font-semibold leading-none tracking-tighter text-foreground/10 sm:text-[11rem]"
        >
          404
        </div>

        <h1 className="-mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          We can’t find that page
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          The link may be broken, or the page may have been moved or deleted.
          Search your products or jump to a section below.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft /> Go back
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
