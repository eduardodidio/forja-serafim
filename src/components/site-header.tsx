import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/colecoes", label: "Coleções" },
  { to: "/monte-seu-deck", label: "Monte seu Deck" },
  { to: "/personalizacao", label: "Personalização" },
  { to: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const { count } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Sparkles className="size-5 shrink-0 text-gold" />
          <span className="truncate font-display text-lg tracking-[0.18em] uppercase text-gradient-gold sm:text-xl">
            A Casa do Serafim
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/carrinho"
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/60 hover:text-gold"
            aria-label="Carrinho"
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-80" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
