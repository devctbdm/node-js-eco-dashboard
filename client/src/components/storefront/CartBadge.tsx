"use client";

import { motion } from "motion/react";

export default function CartBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0.5 }}
      animate={{ scale: 1 }}
      aria-label={`${count} items in cart`}
      className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
    >
      {count}
    </motion.span>
  );
}
