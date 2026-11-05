const Footer = () => {
  return (
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
  );
};

export default Footer;
