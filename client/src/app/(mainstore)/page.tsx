"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Mail,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useState } from "react";

/* ---------- data (replace with Nest.js API) ---------- */
const ease = [0.22, 1, 0.36, 1] as const;

const slides = [
  {
    tag: "New Season",
    title: "Next-level tech\nfor everyday life",
    sub: "Up to 40% off the latest gadgets and accessories.",
    cta: "Shop Electronics",
    bg: "from-indigo-600 via-violet-600 to-fuchsia-600",
    icon: "🎧",
  },
  {
    tag: "Fashion Week",
    title: "Style that moves\nwith you",
    sub: "Fresh arrivals in men's, women's and kids' fashion.",
    cta: "Explore Fashion",
    bg: "from-rose-500 via-pink-600 to-orange-500",
    icon: "👟",
  },
  {
    tag: "Home & Living",
    title: "Make every room\nfeel like home",
    sub: "Furniture, decor and kitchen essentials from $9.",
    cta: "Shop Home",
    bg: "from-emerald-600 via-teal-600 to-cyan-600",
    icon: "🛋️",
  },
];

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

type Product = {
  id: number;
  name: string;
  cat: string;
  price: number;
  old?: number;
  rating: number;
  reviews: number;
  icon: string;
  bg: string;
  tag?: string;
  group: "new" | "best" | "sale";
};
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

/* ---------- header ---------- */
const Header = memo(function Header({ cart }: { cart: number }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground">
        🔥 Free shipping on orders over $50 · Use code <b>WELCOME10</b>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <a href="#" className="text-xl font-extrabold tracking-tight">
          shop<span className="text-primary">.</span>ly
        </a>
        <nav className="ml-6 hidden gap-6 text-sm font-medium lg:flex">
          {["Home", "Shop", "Categories", "Deals", "Contact"].map((n) => (
            <a
              key={n}
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {n}
            </a>
          ))}
        </nav>
        <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products…" className="rounded-full pl-9" />
        </div>
        <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
          <User className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="size-5" />
          {cart > 0 && (
            <motion.span
              key={cart}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
            >
              {cart}
            </motion.span>
          )}
        </Button>
      </div>
    </header>
  );
});

/* ---------- hero slider ---------- */
function Hero() {
  const [[i, dir], set] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = useCallback(
    (d: number) => set(([p]) => [(p + d + slides.length) % slides.length, d]),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [paused, go]);

  const s = slides[i];
  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto mt-6 max-w-7xl overflow-hidden rounded-3xl px-4"
    >
      <div className="relative h-105 overflow-hidden rounded-3xl md:h-125">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%" }),
              center: { x: 0 },
              exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease }}
            className={`absolute inset-0 flex items-center bg-linear-to-br ${s.bg} text-white`}
          >
            <div className="grid w-full items-center gap-6 px-8 md:grid-cols-2 md:px-16">
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease }}
                >
                  <Badge className="bg-white/20 text-white hover:bg-white/20">
                    {s.tag}
                  </Badge>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease }}
                  className="whitespace-pre-line text-4xl font-extrabold leading-tight md:text-6xl"
                >
                  {s.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease }}
                  className="max-w-md text-white/85"
                >
                  {s.sub}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease }}
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-black hover:bg-white/90"
                  >
                    {s.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease }}
                className="hidden select-none justify-center text-[200px] leading-none drop-shadow-2xl md:flex"
              >
                {s.icon}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {[-1, 1].map((d) => (
          <button
            key={d}
            onClick={() => go(d)}
            aria-label={d < 0 ? "Previous" : "Next"}
            className={`absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/35 ${d < 0 ? "left-4" : "right-4"}`}
          >
            {d < 0 ? (
              <ChevronLeft className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>
        ))}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, n) => (
            <button
              key={n}
              onClick={() => set([n, n > i ? 1 : -1])}
              aria-label={`Slide ${n + 1}`}
              className={`h-2 rounded-full bg-white transition-all ${n === i ? "w-8" : "w-2 opacity-50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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

const Card = memo(function Card({
  p,
  onAdd,
}: {
  p: Product;
  onAdd: () => void;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-xl"
    >
      <div
        className={`relative grid aspect-square place-items-center bg-linear-to-br ${p.bg}`}
      >
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
          {p.icon}
        </span>
        {p.tag && <Badge className="absolute left-3 top-3">{p.tag}</Badge>}
        <button
          onClick={() => setLiked(!liked)}
          aria-label="Wishlist"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110"
        >
          <Heart
            className={`size-4 ${liked ? "fill-rose-500 text-rose-500" : "text-slate-600"}`}
          />
        </button>
        <Button
          onClick={onAdd}
          size="sm"
          className="absolute inset-x-3 bottom-3 translate-y-12 rounded-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingCart className="mr-1.5 size-4" />
          Add to cart
        </Button>
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-xs text-muted-foreground">{p.cat}</p>
        <h3 className="line-clamp-1 text-sm font-semibold">{p.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {p.rating} ({p.reviews.toLocaleString()})
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">${p.price}</span>
          {p.old && (
            <span className="text-sm text-muted-foreground line-through">
              ${p.old}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

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
  const [cart, setCart] = useState(0);
  const [tab, setTab] = useState<"all" | Product["group"]>("all");
  const add = useCallback(() => setCart((c) => c + 1), []);
  const list =
    tab === "all" ? products : products.filter((p) => p.group === tab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cart={cart} />
      <Hero />

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
              <Card key={p.id} p={p} onAdd={add} />
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

      {/* footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-xl font-extrabold">
              shop<span className="text-primary">.</span>ly
            </p>
            <p className="text-sm text-muted-foreground">
              Quality products, fast delivery and friendly support — all in one
              place.
            </p>
          </div>
          {[
            ["Shop", ["New arrivals", "Best sellers", "Deals", "Gift cards"]],
            ["Support", ["Help center", "Shipping", "Returns", "Contact us"]],
            ["Company", ["About", "Careers", "Privacy", "Terms"]],
          ].map(([h, l]) => (
            <div key={h as string}>
              <p className="mb-3 text-sm font-semibold">{h}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(l as string[]).map((x) => (
                  <li key={x}>
                    <a href="#" className="hover:text-foreground">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t py-5 text-center text-xs text-muted-foreground">
          © 2026 shop.ly. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
