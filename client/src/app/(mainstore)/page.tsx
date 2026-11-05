"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Headphones,
  Mail,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import HeroSlider from "@/components/storefront/HeroSlider";
import ProductCard, { type Product } from "@/components/storefront/ProductCard";

/* ---------- data (replace with Nest.js API) ---------- */
const ease = [0.22, 1, 0.36, 1] as const;

const categories = [
  ["Electronics", "📱", "bg-indigo-500/10"],
  ["Fashion", "👗", "bg-rose-500/10"],
  ["Home", "🏠", "bg-emerald-500/10"],
  ["Beauty", "💄", "bg-pink-500/10"],
  ["Sports", "⚽", "bg-orange-500/10"],
  ["Toys", "🧸", "bg-yellow-500/10"],
  ["Books", "📚", "bg-sky-500/10"],
  ["Grocery", "🥑", "bg-lime-500/10"],
];

const products: Product[] = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    cat: "Electronics",
    price: 129,
    old: 199,
    rating: 4.8,
    reviews: 1284,
    icon: "🎧",
    bg: "from-indigo-100 to-indigo-200",
    tag: "-35%",
    group: "sale",
  },
  {
    id: 2,
    name: "Smart Watch Series 7",
    cat: "Electronics",
    price: 249,
    rating: 4.7,
    reviews: 932,
    icon: "⌚",
    bg: "from-slate-100 to-slate-300",
    tag: "New",
    group: "new",
  },
  {
    id: 3,
    name: "Classic Leather Backpack",
    cat: "Fashion",
    price: 79,
    old: 110,
    rating: 4.6,
    reviews: 540,
    icon: "🎒",
    bg: "from-amber-100 to-amber-200",
    tag: "-28%",
    group: "sale",
  },
  {
    id: 4,
    name: "Running Sneakers Pro",
    cat: "Sports",
    price: 98,
    rating: 4.9,
    reviews: 2210,
    icon: "👟",
    bg: "from-rose-100 to-rose-200",
    group: "best",
  },
  {
    id: 5,
    name: "Minimalist Desk Lamp",
    cat: "Home",
    price: 39,
    rating: 4.5,
    reviews: 310,
    icon: "💡",
    bg: "from-yellow-100 to-yellow-200",
    tag: "New",
    group: "new",
  },
  {
    id: 6,
    name: "Ceramic Coffee Set",
    cat: "Home",
    price: 45,
    old: 60,
    rating: 4.7,
    reviews: 678,
    icon: "☕",
    bg: "from-orange-100 to-orange-200",
    tag: "-25%",
    group: "sale",
  },
  {
    id: 7,
    name: "Bluetooth Speaker Mini",
    cat: "Electronics",
    price: 59,
    rating: 4.8,
    reviews: 1760,
    icon: "🔊",
    bg: "from-teal-100 to-teal-200",
    group: "best",
  },
  {
    id: 8,
    name: "Premium Skincare Kit",
    cat: "Beauty",
    price: 68,
    rating: 4.9,
    reviews: 890,
    icon: "🧴",
    bg: "from-pink-100 to-pink-200",
    tag: "New",
    group: "new",
  },
];

const perks = [
  [Truck, "Free Shipping", "On orders over $50"],
  [RotateCcw, "30-Day Returns", "Hassle-free refunds"],
  [ShieldCheck, "Secure Payment", "100% protected"],
  [Headphones, "24/7 Support", "Always here to help"],
] as const;

/* ---------- small pieces ---------- */
const Section = ({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, ease }}
    className="mx-auto max-w-7xl px-4 py-12"
  >
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </motion.section>
);

function Countdown() {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const e = new Date();
      e.setHours(23, 59, 59, 999);
      setT(Math.max(0, e.getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const v = t ?? 0,
    u = [
      ["Hrs", Math.floor(v / 36e5)],
      ["Min", Math.floor(v / 6e4) % 60],
      ["Sec", Math.floor(v / 1e3) % 60],
    ] as const;
  return (
    <div className="flex gap-2">
      {u.map(([l, n]) => (
        <div
          key={l}
          className="w-14 rounded-lg bg-white/15 py-2 text-center backdrop-blur"
        >
          <div className="text-xl font-bold tabular-nums">
            {String(n).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase opacity-80">{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- page ---------- */
export default function HomePage() {
  const [tab, setTab] = useState<"all" | Product["group"]>("all");
  const [cart, setCart] = useState(0);
  const addToCart = useCallback(() => setCart((count) => count + 1), []);
  const list =
    tab === "all" ? products : products.filter((p) => p.group === tab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cart={cart} />
      <HeroSlider />

      {/* perks */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 lg:grid-cols-4">
        {perks.map(([Icon, t, s]) => (
          <div
            key={t}
            className="flex items-center gap-3 rounded-2xl border p-4"
          >
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          </div>
        ))}
      </section>

      {/* categories */}
      <Section
        title="Shop by category"
        sub="Find exactly what you need"
        action={
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-1 size-4" />
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map(([n, e, bg]) => (
            <motion.a
              key={n}
              href="#"
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border p-4 transition-shadow hover:shadow-lg"
            >
              <div
                className={`grid size-16 place-items-center rounded-full text-3xl transition-transform group-hover:scale-110 ${bg}`}
              >
                {e}
              </div>
              <span className="text-sm font-medium">{n}</span>
            </motion.a>
          ))}
        </div>
      </Section>

      {/* flash sale */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900 p-8 text-white md:flex-row md:p-10">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-amber-400 text-black hover:bg-amber-400">
              <Zap className="mr-1 size-3" />
              Flash Sale
            </Badge>
            <h2 className="text-3xl font-extrabold">
              Today only — up to 50% off
            </h2>
            <p className="text-sm text-white/70">
              Grab the best deals before the timer runs out.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Countdown />
            <Button
              size="lg"
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              Shop deals
            </Button>
          </div>
        </div>
      </section>

      {/* products */}
      <Section title="Featured products" sub="Handpicked for you">
        <div className="mb-6 flex gap-2">
          {(
            [
              ["all", "All"],
              ["new", "New"],
              ["best", "Best sellers"],
              ["sale", "On sale"],
            ] as const
          ).map(([k, l]) => (
            <Button
              key={k}
              size="sm"
              variant={tab === k ? "default" : "outline"}
              onClick={() => setTab(k)}
              className="rounded-full"
            >
              {l}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </AnimatePresence>
        </div>
      </Section>

      {/* promo banners */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 md:grid-cols-2">
        {[
          [
            "Summer Collection",
            "Light, breezy and bold.",
            "from-orange-400 to-rose-500",
            "🕶️",
          ],
          [
            "Smart Home Deals",
            "Save on connected living.",
            "from-sky-500 to-indigo-600",
            "🏡",
          ],
        ].map(([t, s, g, e]) => (
          <motion.div
            key={t}
            whileHover={{ scale: 1.01 }}
            className={`relative flex h-56 items-center overflow-hidden rounded-3xl bg-linear-to-br ${g} p-8 text-white`}
          >
            <div className="z-10 space-y-3">
              <h3 className="text-2xl font-bold">{t}</h3>
              <p className="text-sm text-white/85">{s}</p>
              <Button
                size="sm"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                Shop now
              </Button>
            </div>
            <span className="absolute -right-2 bottom-0 text-[140px] leading-none opacity-90">
              {e}
            </span>
          </motion.div>
        ))}
      </section>

      {/* newsletter */}
      <Section
        title="Join our newsletter"
        sub="Get 10% off your first order and weekly deals."
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-lg gap-2"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              required
              placeholder="you@email.com"
              className="h-11 rounded-full pl-9"
            />
          </div>
          <Button className="h-11 rounded-full px-6">Subscribe</Button>
        </form>
      </Section>
    </div>
  );
}
