"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  SearchX,
  Upload,
  X,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ----------------------------- dummy data ----------------------------- */

type Status = "Active" | "Draft" | "Archived";
type Product = ReturnType<typeof build>[number];

const categoryHue: Record<string, number> = {
  Clothing: 265,
  Electronics: 235,
  Shoes: 30,
  "Home & living": 150,
  Accessories: 345,
};
const base = [
  ["Merino crew sweater", "Clothing", 128],
  ["Wireless earbuds Pro", "Electronics", 189],
  ["Trail running shoes", "Shoes", 164.5],
  ["Ceramic pour-over set", "Home & living", 72],
  ["Canvas weekender bag", "Accessories", 98.9],
  ["Linen duvet cover", "Home & living", 142],
  ["Smart fitness band", "Electronics", 79],
  ["Leather card wallet", "Accessories", 45],
  ["Everyday sneakers", "Shoes", 110],
  ["Insulated bottle", "Home & living", 34],
  ["Cotton overshirt", "Clothing", 89],
  ["Desk lamp", "Home & living", 59],
  ["Bluetooth speaker", "Electronics", 120],
  ["Wool beanie", "Accessories", 28],
  ["Waterproof jacket", "Clothing", 215],
] as const;
const stocks = [128, 42, 8, 0, 65, 14, 230, 5, 76, 31, 0, 19];
const statuses: Status[] = [
  "Active",
  "Active",
  "Active",
  "Draft",
  "Active",
  "Active",
  "Archived",
  "Active",
];

function build() {
  return Array.from({ length: 30 }, (_, i) => {
    const [n, category, price] = base[i % base.length];
    return {
      id: `p${i + 1}`,
      name: i < base.length ? n : `${n} (Sand)`,
      sku: `SKU-${1040 - i}`,
      category,
      price: price as number,
      stock: stocks[i % stocks.length],
      sold: 20 + ((i * 37) % 380),
      status: statuses[i % statuses.length],
    };
  });
}

const statusStyle: Record<Status, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Draft: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  Archived: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const PAGE_SIZE = 8;
const tabs = ["All", "Active", "Draft", "Archived"] as const;
const categories = Object.keys(categoryHue);

/* ----------------------------- small parts ---------------------------- */

function Thumb({
  category,
  className = "size-10",
}: {
  category: string;
  className?: string;
}) {
  const h = categoryHue[category] ?? 250;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md border ${className}`}
      style={{
        background: `oklch(0.95 0.03 ${h})`,
        color: `oklch(0.5 0.12 ${h})`,
      }}
      aria-hidden
    >
      <Package className="size-[45%]" />
    </span>
  );
}

function Stock({ value }: { value: number }) {
  if (value === 0)
    return (
      <Badge
        variant="secondary"
        className="bg-rose-500/10 text-rose-700 dark:text-rose-400"
      >
        Out of stock
      </Badge>
    );
  const low = value <= 10;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`size-1.5 rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`}
        aria-hidden
      />
      <span className="tabular-nums">{value}</span>
      {low && (
        <span className="text-xs text-amber-600 dark:text-amber-400">Low</span>
      )}
    </div>
  );
}

/* ------------------------------- page -------------------------------- */

export default function ProductsPage() {
  const reduce = useReducedMotion();
  const [products, setProducts] = React.useState<Product[]>(build);
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [stock, setStock] = React.useState("all");
  const [sort, setSort] = React.useState("newest");
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = React.useState<Product | null>(null);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { All: products.length };
    products.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, [products]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (tab === "All" || p.status === tab) &&
        (category === "all" || p.category === category) &&
        (stock === "all" ||
          (stock === "out"
            ? p.stock === 0
            : stock === "low"
              ? p.stock > 0 && p.stock <= 10
              : p.stock > 10)) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)),
    );
    const s = [...list];
    if (sort === "price-asc") s.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") s.sort((a, b) => b.price - a.price);
    if (sort === "stock-asc") s.sort((a, b) => a.stock - b.stock);
    if (sort === "sold") s.sort((a, b) => b.sold - a.sold);
    return s;
  }, [products, tab, query, category, stock, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = rows.map((r) => r.id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allChecked = rows.length > 0 && selectedOnPage === rows.length;

  const resetPage = () => setPage(1);
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const n = new Set(prev);
      on ? n.add(id) : n.delete(id);
      return n;
    });
  const toggleAll = (on: boolean) =>
    setSelected((prev) => {
      const n = new Set(prev);
      pageIds.forEach((id) => (on ? n.add(id) : n.delete(id)));
      return n;
    });

  function confirmDelete() {
    if (!toDelete) return;
    setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(toDelete.id);
      return n;
    });
    setToDelete(null);
  }

  const menu = (p: Product) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${p.name}`}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Base UI: `render` instead of Radix `asChild` */}
        <DropdownMenuItem
          render={<Link href={`/dashboard/products/${p.id}`} />}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>
          {p.status === "Archived" ? "Restore" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => setToDelete(p)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

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
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your catalog, pricing and inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload /> Import
          </Button>
          <Button variant="outline">
            <Download /> Export
          </Button>
          <Button
            render={<Link href="/dashboard/products/new" />}
            nativeButton={false}
          >
            <Plus /> Add product
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="py-0">
        <CardContent className="grid grid-cols-2 divide-x divide-y p-0 md:grid-cols-4 md:divide-y-0">
          {[
            ["Total products", String(products.length)],
            ["Active", String(counts.Active ?? 0)],
            [
              "Low or out of stock",
              String(products.filter((p) => p.stock <= 10).length),
            ],
            ["Inventory value", money(inventoryValue)],
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

      <Card className="gap-0 py-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-full overflow-x-auto">
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
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
              <TabsList>
                <TabsTrigger value="list" aria-label="List view">
                  <List className="size-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" aria-label="Grid view">
                  <LayoutGrid className="size-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1 sm:max-w-xs">
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
                placeholder="Search name or SKU"
                aria-label="Search products"
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as string);
                resetPage();
              }}
            >
              <SelectTrigger className="w-40" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={stock}
              onValueChange={(v) => {
                setStock(v as string);
                resetPage();
              }}
            >
              <SelectTrigger className="w-36" aria-label="Filter by stock">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any stock</SelectItem>
                <SelectItem value="in">In stock</SelectItem>
                <SelectItem value="low">Low stock</SelectItem>
                <SelectItem value="out">Out of stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as string)}>
              <SelectTrigger
                className="ml-auto w-44"
                aria-label="Sort products"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="sold">Best selling</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="stock-asc">Stock: low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                      Set as active
                    </Button>
                    <Button size="sm" variant="outline">
                      Archive
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

        {/* Results */}
        <AnimatePresence mode="wait" initial={false}>
          {rows.length > 0 && view === "list" && (
            <motion.div
              key="list"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-4">
                      <Checkbox
                        aria-label="Select all products on this page"
                        checked={allChecked}
                        indeterminate={selectedOnPage > 0 && !allChecked}
                        onCheckedChange={(v) => toggleAll(!!v)}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden md:table-cell text-right">
                      Sold
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-12 pr-4">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow
                      key={p.id}
                      data-state={selected.has(p.id) ? "selected" : undefined}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          aria-label={`Select ${p.name}`}
                          checked={selected.has(p.id)}
                          onCheckedChange={(v) => toggle(p.id, !!v)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Thumb category={p.category} />
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/products/${p.id}`}
                              className="block truncate text-sm font-medium hover:underline"
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {p.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {p.category}
                      </TableCell>
                      <TableCell>
                        <Stock value={p.stock} />
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                        {p.sold}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusStyle[p.status]}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {money(p.price)}
                      </TableCell>
                      <TableCell className="pr-4">{menu(p)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          {rows.length > 0 && view === "grid" && (
            <motion.div
              key="grid"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {rows.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="relative">
                    <Thumb
                      category={p.category}
                      className="aspect-[4/3] w-full"
                    />
                    <Badge
                      variant="secondary"
                      className={`absolute left-2 top-2 ${statusStyle[p.status]} bg-background/90`}
                    >
                      {p.status}
                    </Badge>
                    <div className="absolute right-1 top-1">{menu(p)}</div>
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/products/${p.id}`}
                      className="block truncate text-sm font-medium after:absolute after:inset-0 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.category}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm">
                    <span className="font-semibold tabular-nums">
                      {money(p.price)}
                    </span>
                    <Stock value={p.stock} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs text-muted-foreground">
              Try a different search or clear your filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setTab("All");
                setCategory("all");
                setStock("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t p-4">
            <p className="text-xs tabular-nums text-muted-foreground">
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

      {/* Delete confirmation */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} will be removed from your catalog. Past orders
              keep their records. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep product</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
