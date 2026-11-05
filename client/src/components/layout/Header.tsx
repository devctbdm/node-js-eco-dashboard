import { Search, ShoppingCart, User } from "lucide-react";
import { memo } from "react";
import CartBadge from "../storefront/CartBadge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Logo } from "./Logo";

const Header = memo(function Header({ cart }: { cart: number }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground">
        🔥 Free shipping on orders over $50 · Use code <b>WELCOME10</b>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo href="/" size="lg" className="mr-6" />
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
          <CartBadge count={cart} />
        </Button>
      </div>
    </header>
  );
});

export default Header;
