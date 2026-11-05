"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "motion/react";
import { memo, useState } from "react";

export type Product = {
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

const ease = [0.22, 1, 0.36, 1] as const;

const ProductCard = memo(function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
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
        className={`relative grid aspect-square place-items-center bg-linear-to-br ${product.bg}`}
      >
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
          {product.icon}
        </span>
        {product.tag && (
          <Badge className="absolute left-3 top-3">{product.tag}</Badge>
        )}
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
        <p className="text-xs text-muted-foreground">{product.cat}</p>
        <h3 className="line-clamp-1 text-sm font-semibold">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {product.rating} ({product.reviews.toLocaleString()})
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">${product.price}</span>
          {product.old && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.old}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
