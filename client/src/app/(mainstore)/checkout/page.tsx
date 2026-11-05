"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Footprints,
  Headphones,
  Keyboard,
  Loader2,
  Lock,
  Minus,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

/* ----------------------------- dummy data ----------------------------- */

type Product = {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  icon: React.ElementType;
  gradient: string;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aero Runner Sneakers",
    variant: "Neon Lime · EU 42",
    price: 129,
    qty: 1,
    icon: Footprints,
    gradient: "from-lime-400 via-emerald-500 to-teal-700",
  },
  {
    id: "p2",
    name: "Halo ANC Headphones",
    variant: "Midnight Violet",
    price: 249,
    qty: 1,
    icon: Headphones,
    gradient: "from-fuchsia-500 via-violet-600 to-indigo-800",
  },
  {
    id: "p3",
    name: "Obsidian 75 Keyboard",
    variant: "Hot-swap · Linear Red",
    price: 159,
    qty: 2,
    icon: Keyboard,
    gradient: "from-orange-400 via-rose-500 to-pink-700",
  },
];

const SHIPPING = [
  { id: "standard", label: "Standard", eta: "4–6 days", price: 0, icon: Truck },
  { id: "express", label: "Express", eta: "2 days", price: 12, icon: Zap },
  {
    id: "overnight",
    label: "Overnight",
    eta: "Tomorrow",
    price: 24,
    icon: Rocket,
  },
];

const PROMOS: Record<string, number> = { COSMIC20: 0.2, WELCOME10: 0.1 };
const TAX_RATE = 0.08;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );

/* ----------------------------- helpers ----------------------------- */

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => money(v));
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

/* ----------------------------- card preview ----------------------------- */

function CardPreview({
  number,
  name,
  expiry,
  cvc,
  flipped,
}: {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  flipped: boolean;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 150,
    damping: 15,
  });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const display = (number || "").padEnd(19, "•").replace(/[0-9]/g, (c) => c);
  const masked = display
    .replace(/[^0-9 ]/g, "•")
    .split(" ")
    .concat(["••••", "••••", "••••", "••••"])
    .slice(0, 4);
  const groups = number.split(" ");
  const shown = masked.map((g, i) =>
    groups[i] ? groups[i].padEnd(4, "•") : "••••",
  );

  return (
    <div
      className="mx-auto w-full max-w-sm perspective-[1000px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative aspect-[1.586/1] w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* front */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-5 shadow-2xl shadow-fuchsia-900/40"
            style={{ backfaceVisibility: "hidden" }}
          >
            <motion.div
              className="pointer-events-none absolute -inset-10 opacity-60 mix-blend-overlay"
              style={{
                background:
                  "radial-gradient(circle at var(--x) var(--y), white, transparent 45%)",
                // @ts-expect-error css vars
                "--x": glareX,
                "--y": glareY,
              }}
            />
            <div className="relative flex h-full flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                <Sparkles className="size-6" />
                <div className="flex">
                  <span className="size-7 rounded-full bg-red-500/90" />
                  <span className="-ml-3 size-7 rounded-full bg-amber-400/90 mix-blend-screen" />
                </div>
              </div>
              <div>
                <div className="mb-4 h-8 w-11 rounded-md bg-linear-to-br from-amber-200 to-amber-500/80" />
                <p className="font-mono text-lg tracking-[0.2em] sm:text-xl">
                  {shown.join(" ")}
                </p>
                <div className="mt-3 flex items-end justify-between text-[11px] uppercase tracking-widest">
                  <div>
                    <p className="text-white/60">Card holder</p>
                    <p className="max-w-42.5 truncate text-sm tracking-wider">
                      {name || "Your Name"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60">Expires</p>
                    <p className="text-sm tracking-wider">
                      {expiry || "MM/YY"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* back */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-zinc-800 to-zinc-950 shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="mt-6 h-11 w-full bg-black" />
            <div className="mx-5 mt-5 flex items-center gap-3">
              <div className="h-9 flex-1 rounded bg-white/10" />
              <div className="flex h-9 w-16 items-center justify-center rounded bg-white font-mono text-sm text-black">
                {cvc.padEnd(3, "•")}
              </div>
            </div>
            <p className="mx-5 mt-4 text-[10px] leading-relaxed text-white/40">
              This is a demo card. No real payment is processed.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ----------------------------- section wrapper ----------------------------- */

function Section({
  index,
  step,
  title,
  children,
}: {
  index: number;
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="rounded-3xl border border-white/10 bg-white/4 p-5 shadow-xl backdrop-blur-xl sm:p-7"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          {step}
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

function Field({
  label,
  id,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-white/60">
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-fuchsia-400/60 focus-visible:ring-fuchsia-500/30"
      />
    </div>
  );
}

/* ----------------------------- page ----------------------------- */

export default function CheckoutPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [shipping, setShipping] = useState("standard");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const subtotal = useMemo(
    () => products.reduce((s, p) => s + p.price * p.qty, 0),
    [products],
  );
  const discount = promo ? subtotal * PROMOS[promo] : 0;
  const shipCost = SHIPPING.find((s) => s.id === shipping)!.price;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipCost + tax;
  const itemCount = products.reduce((s, p) => s + p.qty, 0);

  const updateQty = (id: string, delta: number) =>
    setProducts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p,
      ),
    );
  const remove = (id: string) =>
    setProducts((ps) => ps.filter((p) => p.id !== id));

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMOS[code]) {
      setPromo(code);
      setPromoError(false);
      setPromoInput("");
    } else {
      setPromoError(true);
    }
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle" || products.length === 0) return;
    setOrderNumber(Math.floor(100000 + Math.random() * 899999));
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07060d] text-white selection:bg-fuchsia-500/40">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">NOVA</span>
          </div>
          <Badge className="gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
            <Lock className="size-3" /> Secure checkout
          </Badge>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="bg-linear-to-r from-white via-white to-white/50 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Almost yours.
          </h1>
          <p className="mt-2 text-white/50">
            Review your order and finish up — it takes under a minute.
          </p>
        </motion.div>

        <form
          onSubmit={placeOrder}
          className="grid gap-8 lg:grid-cols-[1fr_420px]"
        >
          {/* LEFT */}
          <div className="space-y-6">
            <Section index={0} step={1} title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Field
                  id="phone"
                  label="Phone"
                  type="tel"
                  placeholder="+1 555 010 2030"
                />
              </div>
            </Section>

            <Section index={1} step={2} title="Shipping address">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="first"
                  label="First name"
                  placeholder="Ada"
                  required
                />
                <Field
                  id="last"
                  label="Last name"
                  placeholder="Lovelace"
                  required
                />
                <div className="sm:col-span-2">
                  <Field
                    id="address"
                    label="Address"
                    placeholder="221B Baker Street"
                    required
                  />
                </div>
                <Field id="city" label="City" placeholder="London" required />
                <div className="grid grid-cols-2 gap-4">
                  <Field id="state" label="State" placeholder="NW" />
                  <Field id="zip" label="ZIP" placeholder="10001" required />
                </div>
              </div>
            </Section>

            <Section index={2} step={3} title="Delivery">
              <RadioGroup
                value={shipping}
                onValueChange={(v) => setShipping(v as string)}
                className="grid gap-3 sm:grid-cols-3"
              >
                {SHIPPING.map((s) => {
                  const active = shipping === s.id;
                  return (
                    <label
                      key={s.id}
                      htmlFor={`ship-${s.id}`}
                      className="relative cursor-pointer"
                    >
                      <RadioGroupItem
                        id={`ship-${s.id}`}
                        value={s.id}
                        className="sr-only"
                      />
                      <motion.div
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative h-full overflow-hidden rounded-2xl border p-4 transition-colors ${
                          active
                            ? "border-fuchsia-400/60 bg-fuchsia-500/10"
                            : "border-white/10 bg-white/3 hover:border-white/25"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="ship-glow"
                            className="absolute inset-0 bg-linear-to-br from-violet-500/20 to-transparent"
                          />
                        )}
                        <div className="relative">
                          <div className="mb-3 flex items-center justify-between">
                            <s.icon
                              className={`size-5 ${active ? "text-fuchsia-300" : "text-white/50"}`}
                            />
                            <AnimatePresence>
                              {active && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex size-5 items-center justify-center rounded-full bg-fuchsia-500"
                                >
                                  <Check className="size-3" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <p className="font-medium">{s.label}</p>
                          <p className="text-xs text-white/50">{s.eta}</p>
                          <p className="mt-2 text-sm font-semibold">
                            {s.price === 0 ? "Free" : money(s.price)}
                          </p>
                        </div>
                      </motion.div>
                    </label>
                  );
                })}
              </RadioGroup>
            </Section>

            <Section index={3} step={4} title="Payment">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <CardPreview {...card} flipped={flipped} />
                <div className="space-y-4">
                  <Field
                    id="cc-number"
                    label="Card number"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: formatCard(e.target.value) })
                    }
                    required
                  />
                  <Field
                    id="cc-name"
                    label="Name on card"
                    placeholder="Ada Lovelace"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      id="cc-exp"
                      label="Expiry"
                      placeholder="MM/YY"
                      inputMode="numeric"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          expiry: formatExpiry(e.target.value),
                        })
                      }
                      required
                    />
                    <Field
                      id="cc-cvc"
                      label="CVC"
                      placeholder="123"
                      inputMode="numeric"
                      value={card.cvc}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          cvc: e.target.value.replace(/\D/g, "").slice(0, 3),
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* RIGHT — summary */}
          <motion.aside
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="lg:sticky lg:top-8 lg:self-start"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <h2 className="font-semibold">Order summary</h2>
                <Badge className="rounded-full bg-white/10 text-white/80">
                  {itemCount} items
                </Badge>
              </div>

              <ul className="max-h-85 space-y-1 overflow-y-auto px-4 py-3">
                <AnimatePresence initial={false}>
                  {products.map((p) => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, x: 40 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="group flex gap-4 rounded-2xl p-2 transition-colors hover:bg-white/4">
                        <motion.div
                          whileHover={{ rotate: -6, scale: 1.06 }}
                          className={`flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${p.gradient} shadow-lg`}
                        >
                          <p.icon className="size-7 text-white drop-shadow" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {p.name}
                              </p>
                              <p className="truncate text-xs text-white/45">
                                {p.variant}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(p.id)}
                              className="text-white/30 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                              aria-label={`Remove ${p.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-white/10 bg-white/5">
                              <button
                                type="button"
                                onClick={() => updateQty(p.id, -1)}
                                className="flex size-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <div className="relative flex h-7 w-6 items-center justify-center overflow-hidden text-sm tabular-nums">
                                <AnimatePresence
                                  mode="popLayout"
                                  initial={false}
                                >
                                  <motion.span
                                    key={p.qty}
                                    initial={{ y: 12, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -12, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    {p.qty}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateQty(p.id, 1)}
                                className="flex size-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <p className="text-sm font-semibold tabular-nums">
                              {money(p.price * p.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {products.length === 0 && (
                  <p className="py-10 text-center text-sm text-white/40">
                    Your cart is empty.
                  </p>
                )}
              </ul>

              <div className="space-y-4 border-t border-white/10 px-6 py-5">
                {/* promo */}
                <div>
                  <AnimatePresence mode="wait" initial={false}>
                    {promo ? (
                      <motion.div
                        key="applied"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-sm text-emerald-300"
                      >
                        <span className="flex items-center gap-2">
                          <BadgeCheck className="size-4" /> {promo} ·{" "}
                          {PROMOS[promo] * 100}% off
                        </span>
                        <button
                          type="button"
                          onClick={() => setPromo(null)}
                          aria-label="Remove code"
                        >
                          <X className="size-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          x: promoError ? [0, -6, 6, -4, 4, 0] : 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                          <Input
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value);
                              setPromoError(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                applyPromo();
                              }
                            }}
                            placeholder="Promo code (try COSMIC20)"
                            className={`h-10 rounded-xl border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-white/30 ${
                              promoError ? "border-rose-400/60" : ""
                            }`}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={applyPromo}
                          variant="secondary"
                          className="h-10 rounded-xl bg-white/10 text-white hover:bg-white/20"
                        >
                          Apply
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {promoError && (
                    <p className="mt-1.5 text-xs text-rose-400">
                      That code isn&apos;t valid.
                    </p>
                  )}
                </div>

                <Separator className="bg-white/10" />

                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-white/60">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-white">
                      <AnimatedNumber value={subtotal} />
                    </dd>
                  </div>
                  <AnimatePresence>
                    {promo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between overflow-hidden text-emerald-300"
                      >
                        <dt>Discount</dt>
                        <dd className="tabular-nums">
                          −<AnimatedNumber value={discount} />
                        </dd>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between text-white/60">
                    <dt>Shipping</dt>
                    <dd className="tabular-nums text-white">
                      {shipCost === 0 ? (
                        "Free"
                      ) : (
                        <AnimatedNumber value={shipCost} />
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <dt>Estimated tax</dt>
                    <dd className="tabular-nums text-white">
                      <AnimatedNumber value={tax} />
                    </dd>
                  </div>
                </dl>

                <Separator className="bg-white/10" />

                <div className="flex items-baseline justify-between">
                  <span className="text-white/70">Total</span>
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">
                    <AnimatedNumber value={total} />
                  </span>
                </div>

                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="submit"
                    disabled={status !== "idle" || products.length === 0}
                    className="group relative h-14 w-full overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-fuchsia-600 to-orange-500 text-base font-semibold text-white shadow-lg shadow-fuchsia-900/40 hover:opacity-95"
                  >
                    <motion.span
                      aria-hidden
                      className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25 blur-md"
                      animate={{ x: ["0%", "500%"] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        repeatDelay: 1.6,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {status === "loading" ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />{" "}
                          Processing…
                        </>
                      ) : (
                        <>
                          <CreditCard className="size-5" /> Pay {money(total)}
                          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                <p className="flex items-center justify-center gap-1.5 text-xs text-white/40">
                  <ShieldCheck className="size-3.5" /> 256-bit encryption ·
                  30-day returns
                </p>
              </div>
            </div>
          </motion.aside>
        </form>
      </div>

      {/* success overlay */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#07060d]/85 p-4 backdrop-blur-md"
          >
            {/* burst */}
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i / 18) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute size-2 rounded-full"
                  style={{
                    background: ["#a78bfa", "#e879f9", "#fb923c", "#34d399"][
                      i % 4
                    ],
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * (160 + (i % 3) * 40),
                    y: Math.sin(angle) * (160 + (i % 3) * 40),
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.25 }}
                />
              );
            })}
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/6 p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                <svg
                  viewBox="0 0 24 24"
                  className="size-10"
                  fill="none"
                  stroke="white"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Order confirmed!</h2>
              <p className="mt-2 text-white/55">
                Thanks for shopping with NOVA. A receipt is on its way to your
                inbox.
              </p>
              <p className="mt-5 rounded-xl bg-white/5 px-4 py-3 font-mono text-sm text-white/70">
                #NV-{orderNumber} · {money(total)}
              </p>
              <Button
                onClick={() => setStatus("idle")}
                className="mt-6 h-11 w-full rounded-xl bg-white text-black hover:bg-white/90"
              >
                Continue shopping
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
