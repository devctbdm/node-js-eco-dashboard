"use client";

import {
  ArrowRight,
  Bookmark,
  Check,
  Lock,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ----------------------------- dummy data ----------------------------- */

type Item = {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  stock: number;
  hue: number;
};

const initialItems: Item[] = [
  {
    id: "p1",
    name: "Merino crew sweater",
    variant: "Oatmeal · M",
    price: 128,
    qty: 1,
    stock: 8,
    hue: 265,
  },
  {
    id: "p2",
    name: "Wireless earbuds Pro",
    variant: "Graphite",
    price: 189,
    qty: 1,
    stock: 3,
    hue: 235,
  },
  {
    id: "p3",
    name: "Ceramic pour-over set",
    variant: "Sand",
    price: 72,
    qty: 2,
    stock: 12,
    hue: 150,
  },
];

const suggestions: Omit<Item, "qty">[] = [
  {
    id: "p4",
    name: "Insulated bottle",
    variant: "Matte black",
    price: 34,
    stock: 20,
    hue: 30,
  },
  {
    id: "p5",
    name: "Wool beanie",
    variant: "Charcoal",
    price: 28,
    stock: 15,
    hue: 345,
  },
  {
    id: "p6",
    name: "Leather card wallet",
    variant: "Tan",
    price: 45,
    stock: 9,
    hue: 60,
  },
];

const FREE_SHIPPING_AT = 150;
const SHIPPING_FEE = 9;
const TAX_RATE = 0.08;
const promoCodes: Record<
  string,
  { label: string; percent?: number; freeShip?: boolean }
> = {
  SAVE10: { label: "10% off your order", percent: 0.1 },
  FREESHIP: { label: "Free shipping", freeShip: true },
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

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
      <Package className="size-[40%]" />
    </span>
  );
}

/* ------------------------------- page -------------------------------- */

export default function CartPage() {
  const reduce = useReducedMotion();
  const [items, setItems] = React.useState<Item[]>(initialItems);
  const [saved, setSaved] = React.useState<Item[]>([]);
  const [undo, setUndo] = React.useState<{ item: Item; index: number } | null>(
    null,
  );
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [promoInput, setPromoInput] = React.useState("");
  const [promo, setPromo] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState("");

  /* ----- totals ----- */
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const code = promo ? promoCodes[promo] : null;
  const discount = code?.percent ? subtotal * code.percent : 0;
  const freeShip = subtotal >= FREE_SHIPPING_AT || !!code?.freeShip;
  const shipping = items.length === 0 || freeShip ? 0 : SHIPPING_FEE;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  /* ----- actions ----- */
  const setQty = (id: string, qty: number) =>
    setItems((l) =>
      l.map((i) =>
        i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, qty)) } : i,
      ),
    );

  function remove(id: string) {
    const index = items.findIndex((i) => i.id === id);
    const item = items[index];
    setItems((l) => l.filter((i) => i.id !== id));
    setUndo({ item, index });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }
  function restore() {
    if (!undo) return;
    setItems((l) => {
      const n = [...l];
      n.splice(Math.min(undo.index, n.length), 0, undo.item);
      return n;
    });
    setUndo(null);
  }
  function saveForLater(item: Item) {
    setItems((l) => l.filter((i) => i.id !== item.id));
    setSaved((l) => [...l, item]);
  }
  function moveToCart(item: Item) {
    setSaved((l) => l.filter((i) => i.id !== item.id));
    setItems((l) => [...l, item]);
  }
  function addSuggestion(s: Omit<Item, "qty">) {
    setItems((l) =>
      l.some((i) => i.id === s.id)
        ? l.map((i) =>
            i.id === s.id ? { ...i, qty: Math.min(i.stock, i.qty + 1) } : i,
          )
        : [...l, { ...s, qty: 1 }],
    );
  }
  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const c = promoInput.trim().toUpperCase();
    if (!c) return setPromoError("Enter a promo code.");
    if (!promoCodes[c])
      return setPromoError("That code isn’t valid or has expired.");
    setPromo(c);
    setPromoInput("");
    setPromoError("");
  }

  React.useEffect(
    () => () => void (undoTimer.current && clearTimeout(undoTimer.current)),
    [],
  );

  const itemAnim = reduce
    ? {}
    : {
        layout: true as const,
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -16 },
        transition: { duration: 0.22, ease: "easeOut" as const },
      };

  /* ----- empty ----- */
  if (items.length === 0 && saved.length === 0 && !undo) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your cart is empty
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Looks like you haven’t added anything yet. Explore the shop and find
          something you love.
        </p>
        <Button size="lg" render={<Link href="/shop" />} nativeButton={false}>
          Start shopping <ArrowRight />
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Continue shopping
          </Link>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ------------------------- items column ------------------------- */}
          <div className="flex flex-col gap-6">
            {/* free shipping progress */}
            {items.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="size-4 text-muted-foreground" aria-hidden />
                  {freeShip ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      You’ve unlocked free shipping.
                    </span>
                  ) : (
                    <span>
                      Add{" "}
                      <span className="font-semibold tabular-nums">
                        {money(remaining)}
                      </span>{" "}
                      more for free shipping.
                    </span>
                  )}
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={Math.round(freeShip ? 100 : progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress to free shipping"
                >
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      freeShip ? "bg-emerald-500" : "bg-primary",
                    )}
                    animate={{ width: `${freeShip ? 100 : progress}%` }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* items */}
            <ul className="flex flex-col divide-y rounded-xl border bg-card">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    {...itemAnim}
                    className="flex gap-4 p-4 sm:p-5"
                  >
                    <Thumb hue={item.hue} className="size-20 sm:size-24" />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.id}`}
                            className="block truncate font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {item.variant}
                          </p>
                          {item.stock <= 3 && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                              Only {item.stock} left
                            </p>
                          )}
                        </div>
                        <p className="font-semibold tabular-nums">
                          {money(item.price * item.qty)}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                        <div
                          className="inline-flex items-center rounded-lg border"
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-r-none"
                            onClick={() => setQty(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus />
                          </Button>
                          <span
                            className="w-9 text-center text-sm tabular-nums"
                            aria-live="polite"
                          >
                            {item.qty}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-l-none"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => saveForLater(item)}
                          >
                            <Bookmark />{" "}
                            <span className="hidden sm:inline">
                              Save for later
                            </span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(item.id)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 />{" "}
                            <span className="hidden sm:inline">Remove</span>
                          </Button>
                        </div>
                      </div>
                      {item.qty > 1 && (
                        <p className="-mt-1 text-xs text-muted-foreground tabular-nums">
                          {money(item.price)} each
                        </p>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <li className="p-8 text-center text-sm text-muted-foreground">
                  Your cart is empty right now.
                </li>
              )}
            </ul>

            {/* saved for later */}
            {saved.length > 0 && (
              <section aria-labelledby="saved-title">
                <h2
                  id="saved-title"
                  className="mb-3 text-base font-semibold tracking-tight"
                >
                  Saved for later{" "}
                  <span className="text-sm font-normal text-muted-foreground tabular-nums">
                    ({saved.length})
                  </span>
                </h2>
                <ul className="flex flex-col divide-y rounded-xl border bg-card">
                  {saved.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 p-4">
                      <Thumb hue={item.hue} className="size-14" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variant} · {money(item.price)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToCart(item)}
                      >
                        Move to cart
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* suggestions */}
            <section aria-labelledby="more-title">
              <h2
                id="more-title"
                className="mb-3 text-base font-semibold tracking-tight"
              >
                You might also like
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 rounded-xl border bg-card p-3"
                  >
                    <Thumb hue={s.hue} className="aspect-[4/3] w-full" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {money(s.price)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => addSuggestion(s)}
                    >
                      <Plus /> Add to cart
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ------------------------- summary column ------------------------ */}
          <aside
            className="flex flex-col gap-4 lg:sticky lg:top-6"
            aria-label="Order summary"
          >
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-base font-semibold tracking-tight">
                Order summary
              </h2>

              {/* promo */}
              <div className="mt-4">
                {promo ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Check className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">
                        <span className="font-medium">{promo}</span> ·{" "}
                        {promoCodes[promo].label}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPromo(null)}
                      aria-label="Remove promo code"
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyPromo} noValidate>
                    <label htmlFor="promo" className="sr-only">
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="promo"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value);
                            setPromoError("");
                          }}
                          placeholder="Promo code"
                          aria-invalid={!!promoError}
                          aria-describedby="promo-error"
                          className="pl-9 uppercase placeholder:normal-case"
                        />
                      </div>
                      <Button type="submit" variant="outline">
                        Apply
                      </Button>
                    </div>
                    {promoError && (
                      <p
                        id="promo-error"
                        role="alert"
                        className="mt-1.5 text-xs text-destructive"
                      >
                        {promoError}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Try SAVE10 or FREESHIP.
                    </p>
                  </form>
                )}
              </div>

              <dl className="mt-5 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{money(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{money(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {shipping === 0 ? "Free" : money(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estimated tax</dt>
                  <dd className="tabular-nums">{money(tax)}</dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between border-t pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-xl font-semibold tabular-nums tracking-tight">
                    {money(total)}
                  </dd>
                </div>
              </dl>

              <Button
                size="lg"
                className="mt-5 w-full"
                disabled={items.length === 0}
                render={
                  items.length === 0 ? undefined : <Link href="/checkout" />
                }
                nativeButton={items.length === 0}
              >
                Checkout <ArrowRight />
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden /> Secure checkout. Taxes
                finalized at payment.
              </p>
            </div>

            <ul className="grid gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
              <li className="flex items-center gap-3">
                <Truck
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span>Delivery in 3 to 5 business days</span>
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span>Free returns within 30 days</span>
              </li>
            </ul>
          </aside>
        </div>
      </motion.div>

      {/* undo bar */}
      <AnimatePresence>
        {undo && (
          <motion.div
            role="status"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border bg-foreground px-4 py-3 text-sm text-background shadow-lg"
          >
            <span className="truncate">Removed {undo.item.name}</span>
            <button
              type="button"
              onClick={restore}
              className="shrink-0 font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
