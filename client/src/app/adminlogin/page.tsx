"use client";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Loader2,
  Store,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";

/* ------------------------------ config -------------------------------- */

// Your NestJS base URL, e.g. NEXT_PUBLIC_API_URL=http://localhost:4000
// POST -> { email, password, rememberMe }  (sets an httpOnly cookie on success)
const LOGIN_URL = `${API_URL}/auth/login`;
// GET  -> { exists: boolean }  (used only to show a first-time setup link)
const STATUS_URL = `${API_URL}/auth/super-admin/status`;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ------------------------------- page -------------------------------- */

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [needsSetup, setNeedsSetup] = React.useState(false);

  // Show a "first time here?" link only when no super admin exists yet
  React.useEffect(() => {
    fetch(STATUS_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { exists: boolean } | null) => d && setNeedsSetup(!d.exists))
      .catch(() => {});
  }, []);

  const errors = {
    email: !emailOk(email) ? "Enter a valid email address." : "",
    password: !password ? "Enter your password." : "",
  };
  const showErr = (k: keyof typeof errors) =>
    (touched[k] || submitted) && errors[k];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (errors.email || errors.password) return;

    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // lets Nest set the httpOnly auth cookie
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe: remember,
        }),
      });
      if (res.status === 401) {
        setError("Incorrect email or password.");
        return;
      }
      if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      if (res.status === 403) {
        setError("This account is disabled. Contact your administrator.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        setError(msg ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Can’t reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* ------------------------- form side ------------------------- */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" aria-hidden />
          </span>
          Your Store
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.form
            onSubmit={onSubmit}
            noValidate
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex w-full max-w-sm flex-col gap-6"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome back. Sign in to your admin panel. This page is for
                admins and staff.
              </p>
            </div>

            {error && (
              <motion.div
                role="alert"
                initial={reduce ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                autoComplete="username"
                placeholder="you@company.com"
                aria-invalid={!!showErr("email")}
                aria-describedby="email-error"
              />
              {showErr("email") && (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forget-password"
                  className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={!!showErr("password")}
                  aria-describedby="password-error"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {showErr("password") && (
                <p id="password-error" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(!!v)}
              />
              <Label
                htmlFor="remember"
                className="font-normal text-muted-foreground"
              >
                Keep me signed in for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {needsSetup && (
              <p className="text-center text-sm text-muted-foreground">
                First time here?{" "}
                <Link
                  href="/setup"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Set up your store
                </Link>
              </p>
            )}
          </motion.form>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Your Store. All rights reserved.
        </p>
      </div>

      {/* ------------------------- info side ------------------------- */}
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
            Everything your store needs, in one place.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders, products and customers are waiting for you.
          </p>

          {/* sample snapshot card (decorative dummy data) */}
          <div
            className="mt-8 rounded-xl border bg-card p-5 shadow-xs"
            aria-hidden
          >
            <p className="text-xs text-muted-foreground">Today’s snapshot</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-semibold tabular-nums tracking-tight">
                  $4,820
                </p>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3.5" /> 12.4%
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-xl font-semibold tabular-nums tracking-tight">
                  73
                </p>
                <span className="inline-flex items-center text-xs font-medium text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="size-3.5" /> 2.1%
                </span>
              </div>
            </div>
            <div className="mt-5 flex h-16 items-end gap-1.5">
              {[35, 52, 44, 68, 58, 80, 72, 92].map((h, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-sm bg-primary/80"
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.05,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </aside>
    </main>
  );
}
