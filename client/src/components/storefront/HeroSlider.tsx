"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

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

export default function HeroSlider() {
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

  const slide = slides[i];
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
            className={`absolute inset-0 flex items-center bg-linear-to-br ${slide.bg} text-white`}
          >
            <div className="grid w-full items-center gap-6 px-8 md:grid-cols-2 md:px-16">
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease }}
                >
                  <Badge className="bg-white/20 text-white hover:bg-white/20">
                    {slide.tag}
                  </Badge>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease }}
                  className="whitespace-pre-line text-4xl font-extrabold leading-tight md:text-6xl"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease }}
                  className="max-w-md text-white/85"
                >
                  {slide.sub}
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
                    {slide.cta}
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
                {slide.icon}
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
