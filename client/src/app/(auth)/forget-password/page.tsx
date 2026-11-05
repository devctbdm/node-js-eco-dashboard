"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  Store,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

/* ------------------------------ config -------------------------------- */

// Your NestJS base URL, e.g. NEXT_PUBLIC_API_URL=http://localhost:4000
// POST { email } -> 200/204 always, whether or not the account exists
const FORGOT_URL = `${API_URL}/auth/password/forgot`;
const LOGIN_PATH = "/login";
const RESEND_SECONDS = 60;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const steps = [
  {
    icon: Mail,
    title: "Enter your email",
    text: "Use the address you signed up with.",
  },
  {
    icon: MailCheck,
    title: "Check your inbox",
    text: "We’ll send a secure link. It expires soon.",
  },
  {
    icon: KeyRound,
    title: "Choose a new password",
    text: "Then sign in as usual.",
  },
];

/* ------------------------------- page -------------------------------- */

export default function ForgotPasswordPage() {
  const reduce = useReducedMotion();

  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const emailError =
    touched && !emailOk(email) ? "Enter a valid email address." : "";

  // resend countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function request(): Promise<boolean> {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(FORGOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        return false;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        setError(msg ?? "Something went wrong. Please try again.");
        return false;
      }
      return true;
    } catch {
      setError("Can’t reach the server. Check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailOk(email)) return;
    if (await request()) {
      setSent(true);
      setCooldown(RESEND_SECONDS);
    }
  }

  async function resend() {
    if (cooldown > 0 || loading) return;
    if (await request()) setCooldown(RESEND_SECONDS);
  }

  const fade = {
    initial: reduce ? (false as const) : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.25, ease: "easeOut" as const },
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* ------------------------- form side ------------------------- */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" aria-hidden />
          </span>
          Your Store
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait" initial={false}>
              {!sent ? (
                <motion.form
                  key="form"
                  {...fade}
                  onSubmit={onSubmit}
                  noValidate
                  className="flex flex-col gap-6"
                >
                  <div>
                    <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <KeyRound className="size-5" aria-hidden />
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Forgot your password?
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No problem. Enter your email and we’ll send you a link to
                      reset it.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={!!emailError}
                      aria-describedby="email-error"
                      autoFocus
                    />
                    {emailError && (
                      <p id="email-error" className="text-xs text-destructive">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Sending link…
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>

                  <Link
                    href={LOGIN_PATH}
                    className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden /> Back to sign in
                  </Link>
                </motion.form>
              ) : (
                <motion.div
                  key="sent"
                  {...fade}
                  className="flex flex-col items-start gap-6"
                  role="status"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MailCheck className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Check your email
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      If an account exists for{" "}
                      <span className="font-medium text-foreground break-all">
                        {email.trim()}
                      </span>
                      , we’ve sent a link to reset your password. It expires in
                      30 minutes.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Can’t find it? Check your spam folder.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex w-full items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      {error}
                    </div>
                  )}

                  <div className="flex w-full flex-col gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={resend}
                      disabled={cooldown > 0 || loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" /> Sending…
                        </>
                      ) : cooldown > 0 ? (
                        <span className="tabular-nums">
                          Resend email in {cooldown}s
                        </span>
                      ) : (
                        "Resend email"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSent(false);
                        setError("");
                      }}
                    >
                      Use a different email
                    </Button>
                  </div>

                  <Link
                    href={LOGIN_PATH}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden /> Back to sign in
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Your Store. All rights reserved.
        </p>
      </div>

      {/* ------------------------- steps side ------------------------- */}
      <aside className="relative hidden overflow-hidden border-l bg-muted/40 lg:flex lg:items-center lg:justify-center lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-50 mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="relative w-full max-w-sm"
        >
          <h2 className="text-xl font-semibold tracking-tight">
            Back in three quick steps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It usually takes less than two minutes.
          </p>
          <ol className="mt-8 flex flex-col gap-5">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    sent && i === 0
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background",
                  )}
                >
                  {sent && i === 0 ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Icon className="size-4" aria-hidden />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </aside>
    </main>
  );
}
