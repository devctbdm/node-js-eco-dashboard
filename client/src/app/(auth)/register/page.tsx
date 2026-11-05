"use client";

import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Package,
  PackageCheck,
  Store,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

/* ------------------------------ config -------------------------------- */

// Your NestJS base URL, e.g. NEXT_PUBLIC_API_URL=http://localhost:4000
// POST -> { fullName, email, password, marketingOptIn }  (409 if email exists)
const REGISTER_URL = `${API_URL}/auth/register`;
// Where customers sign in (adjust to your route)
const LOGIN_PATH = "/login";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const rules = [
  { id: "len", label: "12+ characters", test: (v: string) => v.length >= 12 },
  {
    id: "case",
    label: "Upper & lower case",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "num", label: "A number", test: (v: string) => /\d/.test(v) },
];

const benefits = [
  {
    icon: PackageCheck,
    title: "Track every order",
    text: "See updates from checkout to your door.",
  },
  {
    icon: Zap,
    title: "Faster checkout",
    text: "Save addresses and payment details securely.",
  },
  {
    icon: Heart,
    title: "Save your favorites",
    text: "Build a wishlist and get back-in-stock alerts.",
  },
];

/* ------------------------------- page -------------------------------- */

export default function CustomerRegisterPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [emailTaken, setEmailTaken] = React.useState(false);

  const passed = rules.filter((r) => r.test(password)).length;
  const errors = {
    fullName: fullName.trim().length < 2 ? "Enter your full name." : "",
    email: !emailOk(email) ? "Enter a valid email address." : "",
    password:
      passed < rules.length ? "Password doesn’t meet all requirements." : "",
    terms: !terms ? "Please accept the terms to continue." : "",
  };
  const showErr = (k: keyof typeof errors) =>
    (touched[k] || submitted) && errors[k];
  const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    setEmailTaken(false);
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          marketingOptIn: marketing,
        }),
      });
      if (res.status === 409) {
        setEmailTaken(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        setError(msg ?? "We couldn’t create your account. Please try again.");
        return;
      }
      // After sign up, send customers to sign in (or straight to the shop if you auto-login)
      router.push(`${LOGIN_PATH}?registered=true`);
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
                Create your account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Join to check out faster and keep track of your orders.
              </p>
            </div>

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
              or sign up with email
              <span className="h-px flex-1 bg-border" />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={touch("fullName")}
                autoComplete="name"
                placeholder="Jane Cooper"
                aria-invalid={!!showErr("fullName")}
                aria-describedby="fullName-error"
              />
              {showErr("fullName") && (
                <p id="fullName-error" className="text-xs text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTaken(false);
                }}
                onBlur={touch("email")}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!showErr("email") || emailTaken}
                aria-describedby="email-error"
              />
              {showErr("email") && (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
              {emailTaken && (
                <p id="email-error" className="text-xs text-destructive">
                  An account with this email already exists.{" "}
                  <Link
                    href={LOGIN_PATH}
                    className="font-medium underline underline-offset-4"
                  >
                    Sign in instead
                  </Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={touch("password")}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  aria-invalid={!!showErr("password")}
                  aria-describedby="password-rules"
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
              <div className="flex gap-1" aria-hidden>
                {rules.map((_, i) => (
                  <motion.span
                    key={i}
                    className="h-1 flex-1 rounded-full bg-muted"
                    animate={{
                      backgroundColor:
                        i < passed
                          ? passed === rules.length
                            ? "var(--color-emerald-500)"
                            : "var(--color-amber-500)"
                          : "var(--muted)",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <ul
                id="password-rules"
                className="flex flex-wrap gap-x-4 gap-y-1"
              >
                {rules.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li
                      key={r.id}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors",
                        ok
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      <Check
                        className={cn("size-3.5", !ok && "opacity-30")}
                        aria-hidden
                      />
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(v) => {
                      setTerms(!!v);
                      touch("terms")();
                    }}
                    aria-invalid={!!showErr("terms")}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="block text-sm font-normal leading-snug text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-foreground underline underline-offset-4"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-foreground underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </Label>
                </div>
                {showErr("terms") && (
                  <p className="text-xs text-destructive">{errors.terms}</p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={marketing}
                  onCheckedChange={(v) => setMarketing(!!v)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="marketing"
                  className="block text-sm font-normal leading-snug text-muted-foreground"
                >
                  Email me about new arrivals and offers. You can unsubscribe
                  anytime.
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={LOGIN_PATH}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.form>
        </div>
      </div>

      {/* ------------------------- benefits side ------------------------- */}
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
          {/* decorative product tiles */}
          <div className="grid grid-cols-3 gap-3" aria-hidden>
            {[265, 30, 150].map((h, i) => (
              <motion.span
                key={h}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                className="flex aspect-square items-center justify-center rounded-xl border"
                style={{
                  background: `oklch(0.95 0.03 ${h})`,
                  color: `oklch(0.5 0.12 ${h})`,
                }}
              >
                <Package className="size-7" />
              </motion.span>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold tracking-tight">
            Shop faster, with an account.
          </h2>
          <ul className="mt-6 flex flex-col gap-5">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </aside>
    </main>
  );
}
