"use client";

import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Laptop,
  Loader2,
  Smartphone,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

const user = {
  email: "priya@yourstore.com",
  role: "Manager",
  joined: "March 2025",
  lastLogin: "Today, 9:41 AM",
};

const access = [
  ["Products", "View, create, edit, delete"],
  ["Categories", "View, create, edit, delete"],
  ["Orders", "View, create, edit"],
  ["Customers", "View"],
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
];
const languages = [
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা" },
  { value: "es", label: "Español" },
];

const initialSessions = [
  {
    id: "s1",
    device: "MacBook Pro · Chrome",
    place: "Austin, US",
    last: "Active now",
    current: true,
    mobile: false,
  },
  {
    id: "s2",
    device: "iPhone 15 · Safari",
    place: "Austin, US",
    last: "2 hours ago",
    current: false,
    mobile: true,
  },
  {
    id: "s3",
    device: "Windows PC · Edge",
    place: "Dallas, US",
    last: "5 days ago",
    current: false,
    mobile: false,
  },
];

const notifItems = [
  ["orders", "New orders", "When a customer places an order."],
  ["stock", "Low stock alerts", "When a product runs low or sells out."],
  ["refunds", "Refund requests", "When a customer asks for a refund."],
  ["reviews", "Product reviews", "When a new review needs approval."],
  ["report", "Weekly summary", "A recap of sales and activity every Monday."],
] as const;

const activity = [
  ["Updated product “Merino crew sweater”", "Today, 9:52 AM"],
  ["Marked order #10481 as shipped", "Today, 9:20 AM"],
  ["Created category “Winter essentials”", "Yesterday, 4:12 PM"],
  ["Signed in from a new device", "Mon, 8:03 AM"],
  ["Changed password", "Oct 12, 11:30 AM"],
];

const rules = [
  { id: "len", label: "8+ characters", test: (v: string) => v.length >= 8 },
  {
    id: "case",
    label: "Upper & lower case",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "num", label: "A number", test: (v: string) => /\d/.test(v) },
];

const MAX_MB = 2;
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

/* ----------------------------- small parts ---------------------------- */

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid}
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

/* ------------------------------- page -------------------------------- */

export default function ProfilePage() {
  const reduce = useReducedMotion();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [tab, setTab] = React.useState<
    "profile" | "security" | "notifications" | "activity"
  >("profile");

  /* profile */
  const initialProfile = {
    name: "Priya Shah",
    phone: "+1 512 555 0148",
    title: "Store Manager",
    timezone: "America/Chicago",
    language: "en",
  };
  const [profile, setProfile] = React.useState(initialProfile);
  const [savedProfile, setSavedProfile] = React.useState(initialProfile);
  const [nameError, setNameError] = React.useState("");
  const [profileSaved, setProfileSaved] = React.useState(false);
  const [photo, setPhoto] = React.useState<string | undefined>();
  const [photoError, setPhotoError] = React.useState("");
  const profileDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  /* security */
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });
  const [pwSubmitted, setPwSubmitted] = React.useState(false);
  const [pwLoading, setPwLoading] = React.useState(false);
  const [pwDone, setPwDone] = React.useState(false);
  const [twoFa, setTwoFa] = React.useState(true);
  const [sessions, setSessions] = React.useState(initialSessions);

  /* notifications */
  const [notif, setNotif] = React.useState<
    Record<string, { email: boolean; app: boolean }>
  >({
    orders: { email: true, app: true },
    stock: { email: true, app: true },
    refunds: { email: true, app: false },
    reviews: { email: false, app: true },
    report: { email: true, app: false },
  });

  const passed = rules.filter((r) => r.test(pw.next)).length;
  const pwErrors = {
    current: pw.current ? "" : "Enter your current password.",
    next:
      passed < rules.length
        ? "New password doesn’t meet all requirements."
        : "",
    confirm:
      pw.confirm && pw.confirm === pw.next ? "" : "Passwords don’t match.",
  };

  function pickPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setPhotoError("Upload a PNG, JPG or WebP image.");
    if (file.size > MAX_MB * 1024 * 1024)
      return setPhotoError(`Keep the photo under ${MAX_MB} MB.`);
    setPhotoError("");
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (profile.name.trim().length < 2)
      return setNameError("Enter your full name.");
    setNameError("");
    setSavedProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSubmitted(true);
    setPwDone(false);
    if (Object.values(pwErrors).some(Boolean)) return;
    setPwLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // replace with your API call
    setPwLoading(false);
    setPwDone(true);
    setPw({ current: "", next: "", confirm: "" });
    setPwSubmitted(false);
  }

  const fadeProps = {
    initial: reduce ? (false as const) : { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex w-full flex-col gap-6 p-4 md:p-6"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, security and notifications.
        </p>
      </div>

      {/* Identity card */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5">
          <div className="relative">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="size-20 rounded-full border object-cover"
              />
            ) : (
              <span
                className="flex size-20 items-center justify-center rounded-full border bg-muted text-xl font-semibold text-muted-foreground"
                aria-hidden
              >
                {initials(profile.name)}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                pickPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Camera className="size-4" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {profile.name || "Your name"}
              </h2>
              <Badge variant="secondary">{user.role}</Badge>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              >
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {photoError && (
              <p className="mt-1 text-xs text-destructive">{photoError}</p>
            )}
          </div>

          <dl className="flex gap-8 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Member since</dt>
              <dd className="font-medium">{user.joined}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last sign in</dt>
              <dd className="font-medium">{user.lastLogin}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="max-w-full overflow-x-auto">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* ------------------------------ profile ------------------------------ */}
        {tab === "profile" && (
          <motion.div
            key="profile"
            {...fadeProps}
            className="grid w-full items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
          >
            <form onSubmit={saveProfile} noValidate>
              <Card>
                <CardHeader>
                  <CardTitle>Personal details</CardTitle>
                  <CardDescription>
                    This information is visible to other administrators.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pf-name">Full name</Label>
                      <Input
                        id="pf-name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        aria-invalid={!!nameError}
                        autoComplete="name"
                      />
                      {nameError && (
                        <p className="text-xs text-destructive">{nameError}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pf-title">Job title</Label>
                      <Input
                        id="pf-title"
                        value={profile.title}
                        onChange={(e) =>
                          setProfile({ ...profile, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pf-email">Email</Label>
                      <Input
                        id="pf-email"
                        value={user.email}
                        readOnly
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Ask a super admin if you need to change your email.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pf-phone">Phone</Label>
                      <Input
                        id="pf-phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        autoComplete="tel"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Time zone</Label>
                      <Select
                        value={profile.timezone}
                        onValueChange={(v) =>
                          setProfile({ ...profile, timezone: v as string })
                        }
                        items={timezones}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Language</Label>
                      <Select
                        value={profile.language}
                        onValueChange={(v) =>
                          setProfile({ ...profile, language: v as string })
                        }
                        items={languages}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!profileDirty}
                      onClick={() => {
                        setProfile(savedProfile);
                        setNameError("");
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      disabled={!profileDirty && !profileSaved}
                      className="min-w-32"
                    >
                      {profileSaved ? (
                        <>
                          <Check /> Saved
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            <Card>
              <CardHeader>
                <CardTitle>Your access</CardTitle>
                <CardDescription>
                  Set by your {user.role} role. Ask an administrator to change
                  it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {access.map(([area, perms]) => (
                    <li
                      key={area}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                    >
                      <span className="font-medium">{area}</span>
                      <span className="text-right text-xs text-muted-foreground">
                        {perms}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ------------------------------ security ----------------------------- */}
        {tab === "security" && (
          <motion.div
            key="security"
            {...fadeProps}
            className="grid w-full items-start gap-6 xl:grid-cols-2"
          >
            <form onSubmit={changePassword} noValidate>
              <Card>
                <CardHeader>
                  <CardTitle>Change password</CardTitle>
                  <CardDescription>
                    Use a strong password you don’t use anywhere else.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {pwDone && (
                    <div
                      role="status"
                      className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400"
                    >
                      <Check className="size-4" aria-hidden /> Password updated.
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pw-current">Current password</Label>
                    <PasswordInput
                      id="pw-current"
                      value={pw.current}
                      onChange={(v) => setPw({ ...pw, current: v })}
                      autoComplete="current-password"
                      invalid={pwSubmitted && !!pwErrors.current}
                    />
                    {pwSubmitted && pwErrors.current && (
                      <p className="text-xs text-destructive">
                        {pwErrors.current}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pw-new">New password</Label>
                    <PasswordInput
                      id="pw-new"
                      value={pw.next}
                      onChange={(v) => setPw({ ...pw, next: v })}
                      autoComplete="new-password"
                      invalid={pwSubmitted && !!pwErrors.next}
                    />
                    <div className="flex gap-1" aria-hidden>
                      {rules.map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < passed
                              ? passed === rules.length
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                              : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {rules.map((r) => {
                        const ok = r.test(pw.next);
                        return (
                          <li
                            key={r.id}
                            className={cn(
                              "flex items-center gap-1 text-xs",
                              ok
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground",
                            )}
                          >
                            <Check
                              className={cn("size-3.5", !ok && "opacity-30")}
                              aria-hidden
                            />{" "}
                            {r.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pw-confirm">Confirm new password</Label>
                    <PasswordInput
                      id="pw-confirm"
                      value={pw.confirm}
                      onChange={(v) => setPw({ ...pw, confirm: v })}
                      autoComplete="new-password"
                      invalid={pwSubmitted && !!pwErrors.confirm}
                    />
                    {pwSubmitted && pwErrors.confirm && (
                      <p className="text-xs text-destructive">
                        {pwErrors.confirm}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={pwLoading}
                      className="min-w-36"
                    >
                      {pwLoading ? (
                        <>
                          <Loader2 className="animate-spin" /> Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Two-factor authentication</CardTitle>
                  <CardDescription>
                    Add a one-time code from an authenticator app when you sign
                    in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        twoFa
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {twoFa ? "Enabled" : "Disabled"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Authenticator app
                    </span>
                  </div>
                  <Switch
                    checked={twoFa}
                    onCheckedChange={setTwoFa}
                    aria-label="Two-factor authentication"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active sessions</CardTitle>
                  <CardDescription>
                    Devices currently signed in to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="divide-y">
                    {sessions.map((s) => {
                      const Icon = s.mobile ? Smartphone : Laptop;
                      return (
                        <li
                          key={s.id}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 truncate text-sm font-medium">
                              {s.device}
                              {s.current && (
                                <Badge variant="secondary">This device</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.place} · {s.last}
                            </p>
                          </div>
                          {!s.current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSessions((l) =>
                                  l.filter((x) => x.id !== s.id),
                                )
                              }
                            >
                              <Trash2 /> Sign out
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {sessions.length > 1 && (
                    <Button
                      variant="outline"
                      className="self-start"
                      onClick={() =>
                        setSessions((l) => l.filter((x) => x.current))
                      }
                    >
                      Sign out of all other sessions
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ---------------------------- notifications -------------------------- */}
        {tab === "notifications" && (
          <motion.div key="notifications" {...fadeProps} className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how you want to hear about store activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[1fr_64px_64px] items-center gap-y-1 text-sm">
                  <span />
                  <span className="text-center text-xs text-muted-foreground">
                    Email
                  </span>
                  <span className="text-center text-xs text-muted-foreground">
                    In-app
                  </span>
                  {notifItems.map(([id, label, hint]) => (
                    <React.Fragment key={id}>
                      <div className="border-t py-3 pr-4">
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                      <div className="flex justify-center border-t py-3">
                        <Switch
                          checked={notif[id].email}
                          onCheckedChange={(v) =>
                            setNotif((n) => ({
                              ...n,
                              [id]: { ...n[id], email: v },
                            }))
                          }
                          aria-label={`${label} by email`}
                        />
                      </div>
                      <div className="flex justify-center border-t py-3">
                        <Switch
                          checked={notif[id].app}
                          onCheckedChange={(v) =>
                            setNotif((n) => ({
                              ...n,
                              [id]: { ...n[id], app: v },
                            }))
                          }
                          aria-label={`${label} in app`}
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ------------------------------ activity ----------------------------- */}
        {tab === "activity" && (
          <motion.div key="activity" {...fadeProps} className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>
                  Your latest actions in the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="relative flex flex-col gap-5 border-l pl-5">
                  {activity.map(([text, time]) => (
                    <li key={text + time} className="relative">
                      <span
                        className="absolute -left-6.25 top-1.5 size-2 rounded-full border bg-background ring-4 ring-background"
                        aria-hidden
                      />
                      <p className="text-sm">{text}</p>
                      <p className="text-xs text-muted-foreground">{time}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
