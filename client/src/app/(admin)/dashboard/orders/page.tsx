"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  PackageSearch,
  Plus,
  Printer,
  Search,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ----------------------------- dummy data ----------------------------- */

type Status = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type Payment = "Paid" | "Unpaid" | "Refunded";
type Order = ReturnType<typeof buildOrders>[number];

const customers = [
  ["Amelia Brooks", "amelia@mail.com", "Austin, TX"],
  ["Noah Fischer", "noah.f@mail.com", "Denver, CO"],
  ["Sofia Romero", "sofia.r@mail.com", "Miami, FL"],
  ["Liam Carter", "liam@mail.com", "Seattle, WA"],
  ["Maya Patel", "maya.p@mail.com", "Chicago, IL"],
  ["Ethan Walsh", "ethan.w@mail.com", "Boston, MA"],
  ["Isla Nguyen", "isla.n@mail.com", "Portland, OR"],
  ["Lucas Meyer", "lucas@mail.com", "Atlanta, GA"],
];
const catalog = [
  { name: "Wireless earbuds Pro", price: 189 },
  { name: "Merino crew sweater", price: 128 },
  { name: "Trail running shoes", price: 164.5 },
  { name: "Ceramic pour-over set", price: 72 },
  { name: "Canvas weekender bag", price: 98.9 },
  { name: "Linen duvet cover", price: 142 },
  { name: "Insulated bottle", price: 34 },
  { name: "Desk lamp, matte black", price: 59 },
];
const cycle: Status[] = [
  "Delivered",
  "Shipped",
  "Processing",
  "Pending",
  "Delivered",
  "Shipped",
  "Cancelled",
  "Processing",
];

function buildOrders() {
  return Array.from({ length: 26 }, (_, i) => {
    const [name, email, city] = customers[(i * 3) % customers.length];
    const lines = Array.from({ length: 1 + (i % 3) }, (_, j) => ({
      ...catalog[(i * 3 + j * 5) % catalog.length],
      qty: 1 + ((i + j) % 2),
    }));
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = subtotal > 150 ? 0 : 9;
    const status = cycle[i % cycle.length];
    const payment: Payment =
      status === "Cancelled"
        ? "Refunded"
        : status === "Pending" && i % 2
          ? "Unpaid"
          : "Paid";
    return {
      id: `#${10500 - i}`,
      name,
      email,
      city,
      lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status,
      payment,
      date: new Date(2026, 9, 30 - Math.floor(i / 2)),
    };
  });
}
const allOrders = buildOrders();

const statusStyle: Record<Status, string> = {
  Pending: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  Processing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Shipped: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};
const paymentStyle: Record<Payment, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Unpaid: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Refunded: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("");

const PAGE_SIZE = 8;
const tabs = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

/* ------------------------------- page -------------------------------- */

export default function OrdersPage() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = React.useState("");
  const [payment, setPayment] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [open, setOpen] = React.useState<Order | null>(null);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { All: allOrders.length };
    allOrders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders.filter(
      (o) =>
        (tab === "All" || o.status === tab) &&
        (payment === "all" || o.payment === payment) &&
        (!q ||
          o.id.includes(q) ||
          o.name.toLowerCase().includes(q) ||
          o.email.includes(q)),
    );
  }, [tab, query, payment]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageIds = rows.map((r) => r.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allChecked = rows.length > 0 && selectedOnPage === rows.length;

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  }
  function toggleAll(on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }
  const resetPage = () => setPage(1);

  const revenue = allOrders
    .filter((o) => o.payment === "Paid")
    .reduce((s, o) => s + o.total, 0);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex w-full  flex-col gap-6 p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Review, fulfill and track every order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download /> Export
          </Button>
          <Button
            render={<Link href="/dashboard/orders/new" />}
            nativeButton={false}
          >
            <Plus /> Create order
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <Card className="py-0">
        <CardContent className="grid grid-cols-2 divide-x divide-y p-0 md:grid-cols-4 md:divide-y-0">
          {[
            ["Total orders", String(allOrders.length)],
            [
              "Awaiting fulfillment",
              String((counts.Pending ?? 0) + (counts.Processing ?? 0)),
            ],
            ["Paid revenue", money(revenue)],
            [
              "Average order",
              money(
                allOrders.reduce((s, o) => s + o.total, 0) / allOrders.length,
              ),
            ],
          ].map(([label, value]) => (
            <div key={label} className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Table card */}
      <Card className="gap-0 py-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="overflow-x-auto">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as typeof tab);
                resetPage();
              }}
            >
              <TabsList>
                {tabs.map((t) => (
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1 sm:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetPage();
                }}
                placeholder="Search by order, name or email"
                aria-label="Search orders"
                className="pl-9"
              />
            </div>
            <Select
              value={payment}
              onValueChange={(v) => {
                setPayment(v as string);
                resetPage();
              }}
            >
              <SelectTrigger className="w-40" aria-label="Filter by payment">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          <AnimatePresence initial={false}>
            {selected.size > 0 && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2">
                  <span className="text-sm font-medium tabular-nums">
                    {selected.size} selected
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Truck /> Mark as shipped
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer /> Print invoices
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(new Set())}
                    >
                      <X /> Clear
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                <Checkbox
                  aria-label="Select all orders on this page"
                  checked={allChecked}
                  indeterminate={selectedOnPage > 0 && !allChecked}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow
                key={o.id}
                data-state={selected.has(o.id) ? "selected" : undefined}
                onClick={() => setOpen(o)}
                className="cursor-pointer"
              >
                <TableCell
                  className="pl-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Select order ${o.id}`}
                    checked={selected.has(o.id)}
                    onCheckedChange={(v) => toggle(o.id, !!v)}
                  />
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {o.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {initials(o.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{o.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {fmtDate(o.date)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant="secondary"
                    className={paymentStyle[o.payment]}
                  >
                    {o.payment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusStyle[o.status]}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(o.total)}
                </TableCell>
                <TableCell
                  className="pr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Base UI: trigger uses `render` instead of Radix `asChild` */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${o.id}`}
                        />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpen(o)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Print invoice</DropdownMenuItem>
                      <DropdownMenuItem>Mark as shipped</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        Cancel order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty state */}
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageSearch className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium">No orders match your filters</p>
            <p className="text-xs text-muted-foreground">
              Try a different search, status or payment filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setTab("All");
                setPayment("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t p-4">
            <p className="text-xs text-muted-foreground tabular-nums">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {(safePage - 1) * PAGE_SIZE + rows.length} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft /> Previous
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {safePage} / {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === pages}
                onClick={() => setPage(safePage + 1)}
              >
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Order details */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  Order {open.id}
                  <Badge
                    variant="secondary"
                    className={statusStyle[open.status]}
                  >
                    {open.status}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  Placed on {fmtDate(open.date)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4">
                <section className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{initials(open.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{open.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {open.email}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold">Items</h3>
                  <ul className="divide-y rounded-lg border">
                    {open.lines.map((l) => (
                      <li
                        key={l.name}
                        className="flex items-center justify-between gap-3 p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{l.name}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {l.qty} × {money(l.price)}
                          </p>
                        </div>
                        <span className="tabular-nums">
                          {money(l.price * l.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold">Summary</h3>
                  <dl className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="tabular-nums">{money(open.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="tabular-nums">
                        {open.shipping ? money(open.shipping) : "Free"}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <dt>Total</dt>
                      <dd className="tabular-nums">{money(open.total)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Payment</dt>
                      <dd>
                        <Badge
                          variant="secondary"
                          className={paymentStyle[open.payment]}
                        >
                          {open.payment}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h3 className="mb-1 text-sm font-semibold">Ships to</h3>
                  <p className="text-sm text-muted-foreground">
                    {open.name}
                    <br />
                    {open.city}
                  </p>
                </section>
              </div>

              <SheetFooter className="flex-row gap-2">
                <Button variant="outline" className="flex-1">
                  <Printer /> Print invoice
                </Button>
                <Button
                  className="flex-1"
                  disabled={
                    open.status === "Delivered" || open.status === "Cancelled"
                  }
                >
                  <Truck /> Mark as shipped
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
