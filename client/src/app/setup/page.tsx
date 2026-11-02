"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Store,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ------------------------------ config -------------------------------- */

// Your NestJS base URL, e.g. NEXT_PUBLIC_API_URL=http://localhost:4000
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
// GET  -> { exists: boolean }   (true once a super admin has been created)
const STATUS_URL = `${API}/auth/super-admin/status`;
// POST -> { fullName, email, password }   (403/409 if one already exists)
const REGISTER_URL = `${API}/auth/super-admin/register`;
// Set to true to preview the form UI before your backend is ready
const SKIP_STATUS_CHECK = false;

type Phase = "checking" | "open" | "locked" | "error" | "done";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const rules = [
  {
    id: "len",
    label: "At least 8 characters",
    test: (v: string) => v.length >= 8,
  },
  {
    id: "case",
    label: "Upper and lower case letters",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  {
    id: "num",
    label: "At least one number",
    test: (v: string) => /\d/.test(v),
  },
];

/* ----------------------------- small parts ---------------------------- */

function PasswordField({
  id,
  value,
  onChange,
  onBlur,
  autoComplete,
  invalid,
  describedBy,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  autoComplete: string;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function FieldError({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p id={id} className="text-xs text-destructive">
      {children}
    </p>
  );
}

function StatusPanel({
  icon,
  title,
  text,
  children,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          tone === "success" &&
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          tone === "danger" && "bg-destructive/10 text-destructive",
          tone === "neutral" && "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------- page -------------------------------- */

export default function AdminRegisterPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [phase, setPhase] = React.useState<Phase>(
    SKIP_STATUS_CHECK ? "open" : "checking",
  );
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  /* Is the store already set up? */
  const checkStatus = React.useCallback(async () => {
    if (SKIP_STATUS_CHECK) return;
    setPhase("checking");
    try {
      const res = await fetch(STATUS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("status");
      const data = (await res.json()) as { exists: boolean };
      setPhase(data.exists ? "locked" : "open");
    } catch {
      setPhase("error");
    }
  }, []);

  React.useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  /* Validation */
  const passed = rules.filter((r) => r.test(password)).length;
  const errors = {
    fullName: fullName.trim().length < 2 ? "Enter your full name." : "",
    email: !emailOk(email) ? "Enter a valid email address." : "",
    password:
      passed < rules.length ? "Password doesn’t meet all requirements." : "",
    confirm: confirm !== password || !confirm ? "Passwords don’t match." : "",
  };
  const show = (k: keyof typeof errors) =>
    (touched[k] || submitted) && errors[k];
  const touch = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
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
        }),
      });
      if (res.status === 403 || res.status === 409) {
        setPhase("locked");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        // Nest's ValidationPipe returns message as string[]
        const msg = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        setServerError(
          msg ?? "We couldn’t create the account. Please try again.",
        );
        return;
      }
      setPhase("done");
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setServerError(
        "Can’t reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const fade = {
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.25, ease: "easeOut" as const },
  };

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
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait" initial={false}>
              {phase === "checking" && (
                <motion.div
                  key="checking"
                  {...fade}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden />{" "}
                  Checking setup status…
                </motion.div>
              )}

              {phase === "error" && (
                <motion.div key="error" {...fade}>
                  <StatusPanel
                    tone="danger"
                    icon={<AlertCircle className="size-5" />}
                    title="Can’t reach the server"
                    text="We couldn’t check whether setup is complete. Make sure your API is running, then try again."
                  >
                    <Button variant="outline" onClick={checkStatus}>
                      Try again
                    </Button>
                  </StatusPanel>
                </motion.div>
              )}

              {phase === "locked" && (
                <motion.div key="locked" {...fade}>
                  <StatusPanel
                    icon={<LockKeyhole className="size-5" />}
                    title="Setup is already complete"
                    text="A super admin account already exists, so this page is closed. Sign in to manage your store."
                  >
                    <Button
                      render={<Link href="/login" />}
                      nativeButton={false}
                    >
                      Go to sign in <ArrowRight />
                    </Button>
                  </StatusPanel>
                </motion.div>
              )}

              {phase === "done" && (
                <motion.div key="done" {...fade}>
                  <StatusPanel
                    tone="success"
                    icon={<Check className="size-5" />}
                    title="Super admin created"
                    text="Your account is ready and this page is now closed. Taking you to sign in…"
                  />
                </motion.div>
              )}

              {phase === "open" && (
                <motion.form
                  key="form"
                  {...fade}
                  onSubmit={onSubmit}
                  noValidate
                  className="flex flex-col gap-6"
                >
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Admin Register
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create the super admin account to finish setting up your
                      store.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      aria-hidden
                    />
                    <p>
                      This page works only once. After the super admin is
                      created, registration is closed for good.
                    </p>
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      {serverError}
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
                      aria-invalid={!!show("fullName")}
                      aria-describedby="fullName-error"
                    />
                    <FieldError id="fullName-error">
                      {show("fullName")}
                    </FieldError>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={touch("email")}
                      autoComplete="email"
                      placeholder="you@company.com"
                      aria-invalid={!!show("email")}
                      aria-describedby="email-error"
                    />
                    <FieldError id="email-error">{show("email")}</FieldError>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordField
                      id="password"
                      value={password}
                      onChange={setPassword}
                      onBlur={touch("password")}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      invalid={!!show("password")}
                      describedBy="password-rules"
                    />
                    {/* strength bar */}
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
                    <ul id="password-rules" className="flex flex-col gap-1">
                      {rules.map((r) => {
                        const ok = r.test(password);
                        return (
                          <li
                            key={r.id}
                            className={cn(
                              "flex items-center gap-1.5 text-xs transition-colors",
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

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <PasswordField
                      id="confirm"
                      value={confirm}
                      onChange={setConfirm}
                      onBlur={touch("confirm")}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      invalid={!!show("confirm")}
                      describedBy="confirm-error"
                    />
                    <FieldError id="confirm-error">
                      {show("confirm")}
                    </FieldError>
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
                      "Sign up as super admin"
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Your Store. All rights reserved.
        </p>
      </div>

      {/* ------------------------- info side ------------------------- */}
      <aside className="relative hidden overflow-hidden border-l bg-muted/40 lg:flex lg:items-center lg:justify-center lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:48px_48px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="relative w-full max-w-sm"
        >
          <h2 className="text-xl font-semibold tracking-tight">
            Welcome. Let’s set up your store.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are the first person here, so this account gets full control of
            the admin panel.
          </p>
          <ol className="mt-8 flex flex-col gap-5">
            {[
              [
                "Create the super admin",
                "Your name, email and a strong password.",
              ],
              ["Sign in to the dashboard", "Use the account you just created."],
              [
                "Invite your team",
                "Add staff and choose what each person can access.",
              ],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums",
                    i === 0
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  {i + 1}
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
