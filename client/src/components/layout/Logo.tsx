"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/* ------------------------------ brand --------------------------------- */

// Change these once and every logo in the app updates
export const BRAND = {
  name: "Your Store",
  tagline: "Admin panel",
} as const;

const sizes = {
  sm: { box: 28, glyph: 16, text: "text-sm", radius: "rounded-md" },
  md: { box: 32, glyph: 18, text: "text-base", radius: "rounded-lg" },
  lg: { box: 44, glyph: 26, text: "text-xl", radius: "rounded-xl" },
} as const;

export type LogoSize = keyof typeof sizes;

/* ------------------------------ glyph --------------------------------- */

/** The bare bag symbol. Uses currentColor, so it works on any background. */
export function LogoGlyph({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {/* bag */}
      <path d="M5.5 8h13l1 11.2a1.8 1.8 0 0 1-1.8 2H6.3a1.8 1.8 0 0 1-1.8-2L5.5 8z" />
      {/* handle */}
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      {/* smile */}
      <path d="M9.5 13.5a3.2 3.2 0 0 0 5 0" />
    </svg>
  );
}

/* ------------------------------- mark --------------------------------- */

/**
 * The square app icon. Use it alone for a collapsed sidebar, favicon-style
 * spots or avatars.
 *  - solid: filled with your primary color (default)
 *  - outline: bordered, for use on colored backgrounds
 */
export function LogoMark({
  size = "md",
  variant = "solid",
  className,
}: {
  size?: LogoSize;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const s = sizes[size];
  return (
    <span
      style={{ width: s.box, height: s.box }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover/logo:scale-105",
        s.radius,
        variant === "solid"
          ? "bg-primary text-primary-foreground"
          : "border bg-background text-foreground",
        className,
      )}
    >
      <LogoGlyph size={s.glyph} />
    </span>
  );
}

/* ------------------------------- logo --------------------------------- */

/**
 * Mark + store name. Pass `href` to make it a link.
 *
 *   <Logo href="/" />                       header or auth pages
 *   <Logo size="lg" tagline />              login hero
 *   <Logo wordmark={false} />               collapsed sidebar
 */
export function Logo({
  href,
  size = "md",
  wordmark = true,
  tagline = false,
  variant = "solid",
  className,
}: {
  href?: string;
  size?: LogoSize;
  wordmark?: boolean;
  tagline?: boolean;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const s = sizes[size];

  const content = (
    <>
      <LogoMark size={size} variant={variant} />
      {wordmark && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={cn("truncate font-semibold tracking-tight", s.text)}>
            {BRAND.name}
          </span>
          {tagline && (
            <span className="truncate text-xs text-muted-foreground">
              {BRAND.tagline}
            </span>
          )}
        </span>
      )}
    </>
  );

  const classes = cn("group/logo inline-flex items-center gap-2.5", className);

  return href ? (
    <Link
      href={href}
      aria-label={wordmark ? undefined : BRAND.name}
      className={cn(
        classes,
        "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

/* ------------------------------ loader -------------------------------- */

/**
 * A gentle pulsing mark for full-page loading states
 * (e.g. app/loading.tsx). Respects reduced motion.
 */
export function LogoLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-svh flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <motion.div
        animate={
          reduce ? undefined : { opacity: [1, 0.55, 1], scale: [1, 0.96, 1] }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <LogoMark size="lg" />
      </motion.div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
