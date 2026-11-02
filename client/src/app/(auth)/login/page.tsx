"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Store,
  Truck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ------------------------------ config -------------------------------- */

// Your NestJS base URL, e.g. NEXT_PUBLIC_API_URL=http://localhost:4000
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
// POST -> { email, password, rememberMe }  (sets an httpOnly cookie on success)
const LOGIN_URL = `${API}/auth/customer/login`;
const REGISTER_PATH = "/register";
const FORGOT_PATH = "/account/forgot-password";
const AFTER_LOGIN = "/account";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const steps = ["Placed", "Packed", "Shipped", "Delivered"];

/* ------------------------------- form -------------------------------- */

function CustomerLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();

  const justRegistered = params.get("registered") === "true";
  // only allow same-site relative redirects
  const next = params.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : AFTER_LOGIN;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const errors = {
    email: !emailOk(email) ? "Enter a valid email address." : "",
    password: !password ? "Enter your password." : "",
  };
  const showErr = (k: keyof typeof errors) =>
    (touched[k] || submitted) && errors[k];
  const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        setError(msg ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(safeNext);
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
          <motion.form
            onSubmit={onSubmit}
            noValidate
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex w-full max-w-sm flex-col gap-5"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to view your orders and check out faster.
              </p>
            </div>

            {justRegistered && !error && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                Your account is ready. Sign in to get started.
              </div>
            )}

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

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.74l4-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or sign in with email
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={touch("email")}
                autoComplete="username"
                placeholder="you@example.com"
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
                  href={FORGOT_PATH}
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
                  onBlur={touch("password")}
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
                Keep me signed in
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

            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                href={REGISTER_PATH}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </motion.form>
        </div>
      </div>

      {/* ------------------------- tracking side ------------------------- */}
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
            Your orders, always in view.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow every delivery, reorder favorites and manage returns in one
            place.
          </p>

          {/* sample order card (decorative dummy data) */}
          <div
            className="mt-8 rounded-xl border bg-card p-5 shadow-xs"
            aria-hidden
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Order #10482</p>
                <p className="mt-0.5 text-sm font-medium">
                  Merino crew sweater + 1 item
                </p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Truck className="size-4" />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-1.5">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-col gap-1.5">
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: i < 3 ? "100%" : "0%" }}
                      transition={{
                        duration: 0.5,
                        delay: 0.35 + i * 0.15,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px]",
                      i < 3 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Out for delivery. Arriving today by 6:00 PM.
            </p>
          </div>
        </motion.div>
      </aside>
    </main>
  );
}

/* useSearchParams needs a Suspense boundary in the App Router */
export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={null}>
      <CustomerLogin />
    </React.Suspense>
  );
}
