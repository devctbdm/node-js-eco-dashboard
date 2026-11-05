"use client";

import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Laptop,
  Loader2,
  LogOut,
  MapPin,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";
type Line = {
  name: string;
  variant: string;
  qty: number;
  price: number;
  hue: number;
};
type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  lines: Line[];
  shipping: number;
  card: string;
  address: string;
};
type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const L = (
  name: string,
  variant: string,
  qty: number,
  price: number,
  hue: number,
): Line => ({ name, variant, qty, price, hue });

const initialOrders: Order[] = [
  {
    id: "#10482",
    date: "2026-11-02",
    status: "Processing",
    shipping: 0,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [
      L("Merino crew sweater", "Oatmeal · M", 1, 128, 265),
      L("Insulated bottle", "Matte black", 1, 34, 30),
    ],
  },
  {
    id: "#10471",
    date: "2026-10-28",
    status: "Shipped",
    shipping: 0,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [L("Wireless earbuds Pro", "Graphite", 1, 189, 235)],
  },
  {
    id: "#10433",
    date: "2026-10-15",
    status: "Delivered",
    shipping: 9,
    card: "Mastercard •••• 8812",
    address: "Work",
    lines: [L("Ceramic pour-over set", "Sand", 1, 72, 150)],
  },
  {
    id: "#10390",
    date: "2026-09-30",
    status: "Delivered",
    shipping: 0,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [
      L("Trail running shoes", "Slate · 9", 1, 164.5, 30),
      L("Wool beanie", "Charcoal", 2, 28, 345),
    ],
  },
  {
    id: "#10344",
    date: "2026-09-12",
    status: "Cancelled",
    shipping: 9,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [L("Canvas weekender bag", "Olive", 1, 98.9, 60)],
  },
  {
    id: "#10281",
    date: "2026-08-21",
    status: "Delivered",
    shipping: 0,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [
      L("Linen duvet cover", "Queen · White", 1, 142, 150),
      L("Desk lamp", "Matte black", 1, 59, 235),
    ],
  },
  {
    id: "#10202",
    date: "2026-07-04",
    status: "Delivered",
    shipping: 9,
    card: "Visa •••• 4242",
    address: "Home",
    lines: [L("Leather card wallet", "Tan", 1, 45, 60)],
  },
];

const initialAddresses: Address[] = [
  {
    id: "ad1",
    label: "Home",
    name: "Jane Cooper",
    phone: "+1 512 555 0148",
    street: "1420 Maple Street, Apt 3B",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    isDefault: true,
  },
  {
    id: "ad2",
    label: "Work",
    name: "Jane Cooper",
    phone: "+1 512 555 0190",
    street: "200 Congress Avenue",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    isDefault: false,
  },
];

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Bangladesh",
  "Australia",
].map((c) => ({ value: c, label: c }));
const labels = ["Home", "Work", "Other"].map((c) => ({ value: c, label: c }));

const sessions0 = [
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

const statusStyle: Record<OrderStatus, string> = {
  Processing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Shipped: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};
const stepOf: Record<OrderStatus, number> = {
  Processing: 1,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 0,
};
const trackSteps = ["Placed", "Packed", "Shipped", "Delivered"];

const nav = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;
type Section = (typeof nav)[number]["id"];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtDate = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
const orderSubtotal = (o: Order) =>
  o.lines.reduce((s, l) => s + l.price * l.qty, 0);
const MAX_MB = 2;
const PAGE = 3;

/* ----------------------------- small parts ---------------------------- */

function Thumb({ hue, className }: { hue: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border",
        className,
      )}
      style={{
        background: `oklch(0.95 0.03 ${hue})`,
        color: `oklch(0.5 0.12 ${hue})`,
      }}
    >
      <Package className="size-[45%]" />
    </span>
  );
}

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <header className="border-b p-5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

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

export default function AccountPage() {
  const reduce = useReducedMotion();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [section, setSection] = React.useState<Section>("profile");

  /* profile */
  const p0 = {
    name: "Jane Cooper",
    email: "jane@example.com",
    phone: "+1 512 555 0148",
    birthday: "1992-04-18",
  };
  const [profile, setProfile] = React.useState(p0);
  const [savedProfile, setSavedProfile] = React.useState(p0);
  const [profileErrors, setProfileErrors] = React.useState<{
    name?: string;
    email?: string;
  }>({});
  const [profileSaved, setProfileSaved] = React.useState(false);
  const [photo, setPhoto] = React.useState<string | undefined>();
  const [photoError, setPhotoError] = React.useState("");
  const profileDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  /* orders */
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [filter, setFilter] = React.useState<"All" | OrderStatus>("All");
  const [query, setQuery] = React.useState("");
  const [shown, setShown] = React.useState(PAGE);
  const [open, setOpen] = React.useState<string | null>("#10482");

  /* addresses */
  const [addresses, setAddresses] = React.useState<Address[]>(initialAddresses);
  const [addrSheet, setAddrSheet] = React.useState<null | { id?: string }>(
    null,
  );
  const blankAddr: Omit<Address, "id"> = {
    label: "Home",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    isDefault: false,
  };
  const [addrForm, setAddrForm] = React.useState(blankAddr);
  const [addrError, setAddrError] = React.useState("");
  const [addrToDelete, setAddrToDelete] = React.useState<Address | null>(null);

  /* security */
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });
  const [pwSubmitted, setPwSubmitted] = React.useState(false);
  const [pwLoading, setPwLoading] = React.useState(false);
  const [pwDone, setPwDone] = React.useState(false);
  const [twoFa, setTwoFa] = React.useState(false);
  const [sessions, setSessions] = React.useState(sessions0);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteText, setDeleteText] = React.useState("");

  /* notifications */
  const [prefs, setPrefs] = React.useState({
    orders: true,
    sms: false,
    deals: true,
    restock: true,
    news: false,
  });

  /* ---------------------------- derived ---------------------------- */
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, [orders]);
  const filtered = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    return (
      (filter === "All" || o.status === filter) &&
      (!q ||
        o.id.includes(q) ||
        o.lines.some((l) => l.name.toLowerCase().includes(q)))
    );
  });
  const totalSpent = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + orderSubtotal(o) + o.shipping, 0);

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

  /* ---------------------------- actions ---------------------------- */
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
    const errs = {
      name:
        profile.name.trim().length < 2 ? "Enter your full name." : undefined,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
        ? "Enter a valid email address."
        : undefined,
    };
    setProfileErrors(errs);
    if (errs.name || errs.email) return;
    setSavedProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function openAddr(a?: Address) {
    setAddrError("");
    if (a) {
      const { id, ...rest } = a;
      setAddrForm(rest);
      setAddrSheet({ id });
    } else {
      setAddrForm({
        ...blankAddr,
        name: profile.name,
        isDefault: addresses.length === 0,
      });
      setAddrSheet({});
    }
  }
  function saveAddr(e: React.FormEvent) {
    e.preventDefault();
    const f = addrForm;
    if (!f.name.trim() || !f.street.trim() || !f.city.trim() || !f.zip.trim())
      return setAddrError("Fill in your name, street, city and postal code.");
    setAddresses((list) => {
      let next = addrSheet?.id
        ? list.map((a) => (a.id === addrSheet.id ? { ...f, id: a.id } : a))
        : [...list, { ...f, id: `ad${Date.now()}` }];
      if (f.isDefault) {
        const keep = addrSheet?.id ?? next[next.length - 1].id;
        next = next.map((a) => ({ ...a, isDefault: a.id === keep }));
      }
      if (!next.some((a) => a.isDefault) && next.length)
        next[0] = { ...next[0], isDefault: true };
      return next;
    });
    setAddrSheet(null);
  }
  function removeAddr(a: Address) {
    setAddresses((list) => {
      const next = list.filter((x) => x.id !== a.id);
      if (a.isDefault && next.length) next[0] = { ...next[0], isDefault: true };
      return next;
    });
    setAddrToDelete(null);
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

  const fade = {
    initial: reduce ? (false as const) : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  };

  /* ----------------------------- render ----------------------------- */
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-8"
      >
        {/* Header */}
        <header className="flex flex-wrap items-center gap-5">
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
                aria-hidden
                className="flex size-20 items-center justify-center rounded-full border bg-muted text-xl font-semibold text-muted-foreground"
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
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border bg-background shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              Hi, {profile.name.split(" ")[0] || "there"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {savedProfile.email} · Member since March 2025
            </p>
            {photoError && (
              <p className="mt-1 text-xs text-destructive">{photoError}</p>
            )}
          </div>
          <dl className="flex gap-6 rounded-xl border bg-card px-5 py-3 text-sm">
            {[
              ["Orders", String(orders.length)],
              ["Total spent", money(totalSpent)],
              ["Reward points", "340"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          {/* Side nav */}
          <nav aria-label="Account sections" className="lg:sticky lg:top-6">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {nav.map(({ id, label, icon: Icon }) => (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSection(id)}
                    aria-current={section === id ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      section === id
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden /> {label}
                  </button>
                </li>
              ))}
              <li className="hidden shrink-0 border-t pt-2 lg:mt-2 lg:block">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  render={<Link href="/account/login" />}
                  nativeButton={false}
                >
                  <LogOut /> Sign out
                </Button>
              </li>
            </ul>
          </nav>

          {/* Content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {/* ------------------------------ profile ------------------------------ */}
              {section === "profile" && (
                <motion.div key="profile" {...fade}>
                  <form onSubmit={saveProfile} noValidate>
                    <Panel
                      title="Personal information"
                      description="Update your name, contact details and birthday."
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="pf-name">Full name</Label>
                          <Input
                            id="pf-name"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            aria-invalid={!!profileErrors.name}
                            autoComplete="name"
                          />
                          {profileErrors.name && (
                            <p className="text-xs text-destructive">
                              {profileErrors.name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="pf-email">Email</Label>
                          <Input
                            id="pf-email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                            aria-invalid={!!profileErrors.email}
                            autoComplete="email"
                          />
                          {profileErrors.email ? (
                            <p className="text-xs text-destructive">
                              {profileErrors.email}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              We’ll ask you to verify a new email.
                            </p>
                          )}
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
                          <Label htmlFor="pf-bday">
                            Birthday{" "}
                            <span className="font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </Label>
                          <Input
                            id="pf-bday"
                            type="date"
                            value={profile.birthday}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                birthday: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            We’ll send you a treat.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!profileDirty}
                          onClick={() => {
                            setProfile(savedProfile);
                            setProfileErrors({});
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
                    </Panel>
                  </form>
                </motion.div>
              )}

              {/* ------------------------------ orders ------------------------------- */}
              {section === "orders" && (
                <motion.div
                  key="orders"
                  {...fade}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-3">
                    <div className="max-w-full overflow-x-auto">
                      <Tabs
                        value={filter}
                        onValueChange={(v) => {
                          setFilter(v as typeof filter);
                          setShown(PAGE);
                        }}
                      >
                        <TabsList>
                          {(
                            [
                              "All",
                              "Processing",
                              "Shipped",
                              "Delivered",
                              "Cancelled",
                            ] as const
                          ).map((t) => (
                            <TabsTrigger key={t} value={t}>
                              {t}
                              <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                                {counts[t] ?? 0}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="relative sm:max-w-sm">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <Input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setShown(PAGE);
                        }}
                        placeholder="Search by order number or product"
                        aria-label="Search orders"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <PackageSearch className="size-5" aria-hidden />
                      </span>
                      <p className="text-sm font-medium">No orders found</p>
                      <p className="text-xs text-muted-foreground">
                        Try a different filter or search.
                      </p>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {filtered.slice(0, shown).map((o) => {
                        const isOpen = open === o.id;
                        const sub = orderSubtotal(o);
                        const step = stepOf[o.status];
                        return (
                          <li
                            key={o.id}
                            className="overflow-hidden rounded-xl border bg-card"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
                              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Order
                                  </p>
                                  <p className="font-medium tabular-nums">
                                    {o.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Placed
                                  </p>
                                  <p className="tabular-nums">
                                    {fmtDate(o.date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Total
                                  </p>
                                  <p className="font-medium tabular-nums">
                                    {money(sub + o.shipping)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={statusStyle[o.status]}
                              >
                                {o.status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                              <div className="flex items-center gap-2">
                                {o.lines.slice(0, 4).map((l) => (
                                  <Thumb
                                    key={l.name}
                                    hue={l.hue}
                                    className="size-14"
                                  />
                                ))}
                                <p className="ml-1 text-sm text-muted-foreground">
                                  {o.lines[0].name}
                                  {o.lines.length > 1 &&
                                    ` + ${o.lines.length - 1} more`}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {o.status === "Shipped" && (
                                  <Button
                                    size="sm"
                                    render={
                                      <Link
                                        href={`/account/orders/${o.id.slice(1)}/track`}
                                      />
                                    }
                                    nativeButton={false}
                                  >
                                    Track package
                                  </Button>
                                )}
                                {o.status === "Delivered" && (
                                  <Button size="sm" variant="outline">
                                    <RotateCcw /> Buy again
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setOpen(isOpen ? null : o.id)}
                                  aria-expanded={isOpen}
                                >
                                  Details{" "}
                                  <ChevronDown
                                    className={cn(
                                      "transition-transform",
                                      isOpen && "rotate-180",
                                    )}
                                  />
                                </Button>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={
                                    reduce ? false : { height: 0, opacity: 0 }
                                  }
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.22,
                                    ease: "easeOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-6 border-t p-5">
                                    {o.status === "Cancelled" ? (
                                      <p className="rounded-lg bg-rose-500/5 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                                        This order was cancelled. Any payment
                                        will be refunded in 3 to 5 business
                                        days.
                                      </p>
                                    ) : (
                                      <ol
                                        className="grid grid-cols-4 gap-2"
                                        aria-label="Order progress"
                                      >
                                        {trackSteps.map((s, i) => (
                                          <li
                                            key={s}
                                            className="flex flex-col gap-1.5"
                                          >
                                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                              <motion.div
                                                className="h-full rounded-full bg-primary"
                                                initial={
                                                  reduce ? false : { width: 0 }
                                                }
                                                animate={{
                                                  width:
                                                    i < step ? "100%" : "0%",
                                                }}
                                                transition={{
                                                  duration: 0.5,
                                                  delay: i * 0.1,
                                                }}
                                              />
                                            </div>
                                            <span
                                              className={cn(
                                                "text-xs",
                                                i < step
                                                  ? "font-medium"
                                                  : "text-muted-foreground",
                                              )}
                                            >
                                              {s}
                                            </span>
                                          </li>
                                        ))}
                                      </ol>
                                    )}

                                    <div className="grid gap-6 md:grid-cols-2">
                                      <div>
                                        <h3 className="mb-2 text-sm font-semibold">
                                          Items
                                        </h3>
                                        <ul className="flex flex-col gap-3">
                                          {o.lines.map((l) => (
                                            <li
                                              key={l.name}
                                              className="flex items-center gap-3"
                                            >
                                              <Thumb
                                                hue={l.hue}
                                                className="size-12"
                                              />
                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                  {l.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {l.variant} · Qty {l.qty}
                                                </p>
                                              </div>
                                              <span className="text-sm tabular-nums">
                                                {money(l.price * l.qty)}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="flex flex-col gap-4 text-sm">
                                        <div>
                                          <h3 className="mb-2 font-semibold">
                                            Summary
                                          </h3>
                                          <dl className="flex flex-col gap-1.5">
                                            <div className="flex justify-between">
                                              <dt className="text-muted-foreground">
                                                Subtotal
                                              </dt>
                                              <dd className="tabular-nums">
                                                {money(sub)}
                                              </dd>
                                            </div>
                                            <div className="flex justify-between">
                                              <dt className="text-muted-foreground">
                                                Shipping
                                              </dt>
                                              <dd className="tabular-nums">
                                                {o.shipping
                                                  ? money(o.shipping)
                                                  : "Free"}
                                              </dd>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 font-semibold">
                                              <dt>Total</dt>
                                              <dd className="tabular-nums">
                                                {money(sub + o.shipping)}
                                              </dd>
                                            </div>
                                          </dl>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <h3 className="mb-1 font-semibold">
                                              Ship to
                                            </h3>
                                            <p className="text-muted-foreground">
                                              {addresses.find(
                                                (a) => a.label === o.address,
                                              )?.street ?? o.address}
                                            </p>
                                          </div>
                                          <div>
                                            <h3 className="mb-1 font-semibold">
                                              Payment
                                            </h3>
                                            <p className="text-muted-foreground">
                                              {o.card}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 border-t pt-4">
                                      <Button size="sm" variant="outline">
                                        <FileText /> Download invoice
                                      </Button>
                                      {o.status === "Delivered" && (
                                        <Button size="sm" variant="outline">
                                          Return items
                                        </Button>
                                      )}
                                      {o.status === "Processing" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            setOrders((l) =>
                                              l.map((x) =>
                                                x.id === o.id
                                                  ? {
                                                      ...x,
                                                      status: "Cancelled",
                                                    }
                                                  : x,
                                              ),
                                            )
                                          }
                                        >
                                          Cancel order
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        render={<Link href="/help" />}
                                        nativeButton={false}
                                      >
                                        Need help?
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {filtered.length > shown && (
                    <Button
                      variant="outline"
                      className="self-center"
                      onClick={() => setShown((n) => n + PAGE)}
                    >
                      Show more orders ({filtered.length - shown})
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ----------------------------- addresses ----------------------------- */}
              {section === "addresses" && (
                <motion.div
                  key="addresses"
                  {...fade}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight">
                        Saved addresses
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Choose where we deliver your orders.
                      </p>
                    </div>
                    <Button onClick={() => openAddr()}>
                      <Plus /> Add address
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <article
                        key={a.id}
                        className="flex flex-col gap-3 rounded-xl border bg-card p-5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin
                              className="size-4 text-muted-foreground"
                              aria-hidden
                            />
                            <h3 className="text-sm font-semibold">{a.label}</h3>
                            {a.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                        </div>
                        <address className="text-sm not-italic leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {a.name}
                          </span>
                          <br />
                          {a.street}
                          <br />
                          {a.city}, {a.state} {a.zip}
                          <br />
                          {a.country}
                          <br />
                          {a.phone}
                        </address>
                        <div className="mt-auto flex flex-wrap items-center gap-1 border-t pt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddr(a)}
                          >
                            <Pencil /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddrToDelete(a)}
                          >
                            <Trash2 /> Delete
                          </Button>
                          {!a.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto"
                              onClick={() =>
                                setAddresses((l) =>
                                  l.map((x) => ({
                                    ...x,
                                    isDefault: x.id === a.id,
                                  })),
                                )
                              }
                            >
                              Set as default
                            </Button>
                          )}
                        </div>
                      </article>
                    ))}
                    {addresses.length === 0 && (
                      <div className="col-span-full flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-14 text-center">
                        <MapPin
                          className="size-5 text-muted-foreground"
                          aria-hidden
                        />
                        <p className="text-sm font-medium">
                          No saved addresses
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Add one to check out faster.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ------------------------------ security ----------------------------- */}
              {section === "security" && (
                <motion.div
                  key="security"
                  {...fade}
                  className="flex flex-col gap-6"
                >
                  <form onSubmit={changePassword} noValidate>
                    <Panel
                      title="Change password"
                      description="Use a strong password you don’t use anywhere else."
                    >
                      <div className="flex max-w-md flex-col gap-5">
                        {pwDone && (
                          <div
                            role="status"
                            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400"
                          >
                            <Check className="size-4" aria-hidden /> Password
                            updated.
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
                                    className={cn(
                                      "size-3.5",
                                      !ok && "opacity-30",
                                    )}
                                    aria-hidden
                                  />{" "}
                                  {r.label}
                                </li>
                              );
                            })}
                          </ul>
                          {pwSubmitted && pwErrors.next && (
                            <p className="text-xs text-destructive">
                              {pwErrors.next}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="pw-confirm">
                            Confirm new password
                          </Label>
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
                        <Button
                          type="submit"
                          disabled={pwLoading}
                          className="min-w-36 self-start"
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
                    </Panel>
                  </form>

                  <Panel
                    title="Two-factor authentication"
                    description="Add a one-time code from an authenticator app when you sign in."
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            twoFa
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : ""
                          }
                        >
                          {twoFa ? "Enabled" : "Off"}
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
                    </div>
                  </Panel>

                  <Panel
                    title="Where you’re signed in"
                    description="Sign out of any device you don’t recognize."
                  >
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
                                Sign out
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </Panel>

                  <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                    <h2 className="text-base font-semibold tracking-tight text-destructive">
                      Delete account
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Permanently remove your account, saved addresses and
                      reward points. Your order history is kept for legal
                      reasons.
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-4"
                      onClick={() => {
                        setDeleteText("");
                        setDeleteOpen(true);
                      }}
                    >
                      Delete my account
                    </Button>
                  </section>
                </motion.div>
              )}

              {/* --------------------------- notifications --------------------------- */}
              {section === "notifications" && (
                <motion.div key="notifications" {...fade}>
                  <Panel
                    title="Notification preferences"
                    description="Choose what we email or text you. Order updates are always sent for your safety."
                  >
                    <ul className="divide-y">
                      {(
                        [
                          [
                            "orders",
                            "Order updates by email",
                            "Confirmations, shipping and delivery updates.",
                          ],
                          [
                            "sms",
                            "Delivery texts",
                            "Get an SMS when your package is out for delivery.",
                          ],
                          [
                            "deals",
                            "Offers and promotions",
                            "Sales, discounts and early access.",
                          ],
                          [
                            "restock",
                            "Back-in-stock alerts",
                            "When items on your wishlist return.",
                          ],
                          [
                            "news",
                            "Newsletter",
                            "Style guides and stories, once a month.",
                          ],
                        ] as const
                      ).map(([key, title, hint]) => (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div>
                            <Label
                              htmlFor={`pref-${key}`}
                              className="text-sm font-medium"
                            >
                              {title}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {hint}
                            </p>
                          </div>
                          <Switch
                            id={`pref-${key}`}
                            checked={prefs[key]}
                            onCheckedChange={(v) =>
                              setPrefs((p) => ({ ...p, [key]: v }))
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Address sheet */}
      <Sheet open={!!addrSheet} onOpenChange={(v) => !v && setAddrSheet(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <form
            onSubmit={saveAddr}
            noValidate
            className="flex min-h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>
                {addrSheet?.id ? "Edit address" : "Add address"}
              </SheetTitle>
              <SheetDescription>
                Where should we deliver your orders?
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <Label>Label</Label>
                <Select
                  value={addrForm.label}
                  onValueChange={(v) =>
                    setAddrForm({ ...addrForm, label: v as string })
                  }
                  items={labels}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(
                [
                  ["name", "Full name", "name"],
                  ["phone", "Phone", "tel"],
                  ["street", "Street address", "street-address"],
                ] as const
              ).map(([k, label, ac]) => (
                <div key={k} className="flex flex-col gap-2">
                  <Label htmlFor={`ad-${k}`}>{label}</Label>
                  <Input
                    id={`ad-${k}`}
                    value={addrForm[k]}
                    autoComplete={ac}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, [k]: e.target.value })
                    }
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ad-city">City</Label>
                  <Input
                    id="ad-city"
                    value={addrForm.city}
                    autoComplete="address-level2"
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ad-state">State / region</Label>
                  <Input
                    id="ad-state"
                    value={addrForm.state}
                    autoComplete="address-level1"
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, state: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ad-zip">Postal code</Label>
                  <Input
                    id="ad-zip"
                    value={addrForm.zip}
                    autoComplete="postal-code"
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, zip: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Country</Label>
                  <Select
                    value={addrForm.country}
                    onValueChange={(v) =>
                      setAddrForm({ ...addrForm, country: v as string })
                    }
                    items={countries}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <Label htmlFor="ad-default" className="font-normal">
                  Use as my default address
                </Label>
                <Switch
                  id="ad-default"
                  checked={addrForm.isDefault}
                  onCheckedChange={(v) =>
                    setAddrForm({ ...addrForm, isDefault: v })
                  }
                />
              </div>
              {addrError && (
                <p role="alert" className="text-sm text-destructive">
                  {addrError}
                </p>
              )}
            </div>
            <SheetFooter className="flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAddrSheet(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save address
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete address */}
      <AlertDialog
        open={!!addrToDelete}
        onOpenChange={(v) => !v && setAddrToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {addrToDelete?.label} ({addrToDelete?.street}) will be removed
              from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep address</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => addrToDelete && removeAddr(addrToDelete)}
            >
              Delete address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This can’t be undone. Type DELETE to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my account</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteText !== "DELETE"}
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
