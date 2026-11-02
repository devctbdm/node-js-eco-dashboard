"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowUpDown,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ---------- types & config ---------- */
type Status = "active" | "inactive" | "blocked";
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: Status;
  totalSpent: number;
  orders: number;
  products: number;
  lastLogin: string;
  joinedAt: string;
};
type SortKey = "name" | "totalSpent" | "orders" | "products" | "lastLogin";

const API = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:3001
const PER_PAGE = 10;
const ease = [0.22, 1, 0.36, 1] as const;
const statusStyle: Record<Status, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  inactive: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  blocked: "bg-red-500/10 text-red-600 border-red-500/20",
};

/* ---------- mock fallback (remove once Nest.js is ready) ---------- */
const mock = (): Customer[] =>
  Array.from({ length: 48 }, (_, i) => {
    const n = [
      "Ava",
      "Liam",
      "Noah",
      "Emma",
      "Omar",
      "Sara",
      "Raj",
      "Mia",
      "Zain",
      "Lena",
    ][i % 10];
    const l = ["Khan", "Smith", "Rahman", "Lee", "Silva", "Ali", "Chen", "Roy"][
      i % 8
    ];
    return {
      id: `C-${1000 + i}`,
      name: `${n} ${l}`,
      email: `${n}.${l}${i}@mail.com`.toLowerCase(),
      phone: `+880 17${String(10000000 + i * 7919).slice(0, 8)}`,
      country: ["BD", "US", "UK", "DE", "IN"][i % 5],
      status: (["active", "active", "inactive", "blocked"] as Status[])[i % 4],
      totalSpent: Math.round(((i * 7919) % 9000) + 120),
      orders: ((i * 3) % 40) + 1,
      products: ((i * 5) % 90) + 1,
      lastLogin: new Date(Date.now() - ((i * 37) % 500) * 3600e3).toISOString(),
      joinedAt: new Date(
        Date.now() - (((i * 11) % 400) + 10) * 864e5,
      ).toISOString(),
    };
  });

/* ---------- helpers ---------- */
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const ago = (iso: string) => {
  const h = (new Date(iso).getTime() - Date.now()) / 3600e3;
  return Math.abs(h) < 24
    ? rtf.format(Math.round(h), "hour")
    : rtf.format(Math.round(h / 24), "day");
};
const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("");

/* ---------- small parts ---------- */
const Stat = memo(function Stat({
  icon: Icon,
  label,
  value,
  i,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  i: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.05, ease }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold tabular-nums">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const Row = memo(function Row({
  c,
  i,
  onOpen,
}: {
  c: Customer;
  i: number;
  onOpen: (c: Customer) => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: i * 0.02, ease }}
      onClick={() => onOpen(c)}
      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {initials(c.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`capitalize ${statusStyle[c.status]}`}
        >
          {c.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {money(c.totalSpent)}
      </TableCell>
      <TableCell className="text-right tabular-nums">{c.orders}</TableCell>
      <TableCell className="text-right tabular-nums">{c.products}</TableCell>
      <TableCell className="text-muted-foreground">
        {ago(c.lastLogin)}
      </TableCell>
    </motion.tr>
  );
});

/* ---------- quick add (sheet) ---------- */
const blank = {
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "active" as Status,
};
const genPass = () =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(12)),
    (b) => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 56],
  ).join("");

function QuickAdd({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (c: Customer) => void;
}) {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof blank, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr((p) => ({ ...p, [k]: "", api: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Enter full name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email = "Invalid email";
    if (f.password.length < 8) v.password = "Min 8 characters";
    setErr(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      let c: Partial<Customer> = {};
      if (API) {
        const r = await fetch(`${API}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(f),
        });
        if (!r.ok)
          throw new Error(
            (await r.json().catch(() => ({}))).message ||
              "Failed to create account",
          );
        c = await r.json();
      }
      const now = new Date().toISOString();
      onCreated({
        id: `C-${Date.now().toString().slice(-6)}`,
        country: "BD",
        totalSpent: 0,
        orders: 0,
        products: 0,
        lastLogin: now,
        joinedAt: now,
        ...f,
        ...c,
      } as Customer);
      setF(blank);
      onOpenChange(false);
    } catch (x) {
      setErr({ api: x instanceof Error ? x.message : "Something went wrong" });
    }
    setBusy(false);
  };

  const field = (
    k: "name" | "email" | "phone",
    label: string,
    ph: string,
    type = "text",
  ) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={ph}
        aria-invalid={!!err[k]}
      />
      {err[k] && <p className="text-xs text-destructive">{err[k]}</p>}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
          <SheetDescription>Create an account in seconds.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} noValidate className="space-y-4 px-4 pb-4">
          {field("name", "Full name", "Ava Khan")}
          {field("email", "Email", "ava@mail.com", "email")}
          {field("phone", "Phone (optional)", "+880 1700000000")}
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="flex gap-2">
              <Input
                value={f.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min 8 characters"
                aria-invalid={!!err.password}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => set("password", genPass())}
              >
                <KeyRound className="mr-1.5 size-4" />
                Generate
              </Button>
            </div>
            {err.password && (
              <p className="text-xs text-destructive">{err.password}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={f.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {err.api && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err.api}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- page ---------- */
export default function CustomersPage() {
  const [data, setData] = useState<Customer[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "lastLogin",
    dir: -1,
  });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Customer | null>(null);
  const [adding, setAdding] = useState(false);
  const dq = useDeferredValue(q);

  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      try {
        if (!API) throw 0;
        const r = await fetch(`${API}/customers`, { signal: ctl.signal });
        setData(await r.json());
      } catch {
        if (!ctl.signal.aborted) setData(mock());
      }
    })();
    return () => ctl.abort();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const s = dq.trim().toLowerCase();
    return data
      .filter(
        (c) =>
          (status === "all" || c.status === status) &&
          (!s || `${c.name} ${c.email} ${c.id}`.toLowerCase().includes(s)),
      )
      .sort((a, b) => {
        const x = a[sort.key],
          y = b[sort.key];
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });
  }, [data, dq, status, sort]);

  const stats = useMemo(() => {
    const d = data ?? [];
    const spent = d.reduce((t, c) => t + c.totalSpent, 0);
    return {
      total: d.length,
      spent,
      avg: d.length ? spent / d.length : 0,
      active: d.filter((c) => c.status === "active").length,
    };
  }, [data]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const view = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }));
    setPage(1);
  };
  const onOpen = useCallback((c: Customer) => setOpen(c), []);

  const setCustomerStatus = async (c: Customer, next: Status) => {
    const upd = { ...c, status: next };
    setData((d) => d!.map((x) => (x.id === c.id ? upd : x)));
    setOpen(upd);
    if (API)
      fetch(`${API}/customers/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      }).catch(() => {});
  };

  const Th = ({
    k,
    children,
    right,
  }: {
    k: SortKey;
    children: React.ReactNode;
    right?: boolean;
  }) => (
    <TableHead className={right ? "text-right" : ""}>
      <button
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${sort.key === k ? "text-foreground" : ""}`}
      >
        {children}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, spending and activity.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 size-4" />
          Add customer
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          i={0}
          icon={Users}
          label="Total customers"
          value={String(stats.total)}
        />
        <Stat
          i={1}
          icon={Activity}
          label="Active"
          value={String(stats.active)}
        />
        <Stat
          i={2}
          icon={Wallet}
          label="Total revenue"
          value={money(stats.spent)}
        />
        <Stat
          i={3}
          icon={ShoppingBag}
          label="Avg. spend"
          value={money(stats.avg)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, ID…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as typeof status);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <Th k="name">Customer</Th>
              <TableHead>Status</TableHead>
              <Th k="totalSpent" right>
                Total spent
              </Th>
              <Th k="orders" right>
                Orders
              </Th>
              <Th k="products" right>
                Products
              </Th>
              <Th k="lastLogin">Last login</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : view.length ? (
              view.map((c, i) => (
                <Row
                  key={`${page}-${sort.key}-${c.id}`}
                  c={c}
                  i={i}
                  onOpen={onOpen}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>{rows.length} results</span>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <QuickAdd
        open={adding}
        onOpenChange={setAdding}
        onCreated={(c) => {
          setData((d) => [c, ...(d ?? [])]);
          setSort({ key: "lastLogin", dir: -1 });
          setPage(1);
        }}
      />

      {/* Details drawer */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key={open.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease }}
                className="space-y-6 p-4"
              >
                <SheetHeader className="p-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback>{initials(open.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle>{open.name}</SheetTitle>
                      <SheetDescription>
                        {open.id} · {open.country}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Spent", money(open.totalSpent)],
                    ["Orders", open.orders],
                    ["Products", open.products],
                  ].map(([l, v]) => (
                    <div key={l as string} className="rounded-lg border p-3">
                      <p className="text-lg font-semibold tabular-nums">{v}</p>
                      <p className="text-xs text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>

                <dl className="space-y-3 text-sm">
                  {[
                    ["Email", open.email],
                    ["Phone", open.phone],
                    ["Joined", date(open.joinedAt)],
                    [
                      "Last login",
                      `${ago(open.lastLogin)} (${date(open.lastLogin)})`,
                    ],
                    [
                      "Avg. order",
                      money(open.totalSpent / Math.max(open.orders, 1)),
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-4 border-b pb-2"
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusStyle[open.status]}`}
                      >
                        {open.status}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                {open.status === "blocked" ? (
                  <Button
                    className="w-full"
                    onClick={() => setCustomerStatus(open, "active")}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Unblock customer
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCustomerStatus(open, "blocked")}
                  >
                    <Ban className="mr-2 size-4" />
                    Block customer
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}
