import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";

import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/store-data";

const links = [
  { to: "/", label: "Home" },
  { to: "/colecoes", label: "Colecoes" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      setIsDark(stored !== "light");
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage unavailable */
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src="/images/logo-forja-serafim.jpg"
            alt="Forja Serafim"
            className="size-8 shrink-0 rounded-full object-cover"
          />
          <span className="truncate font-display text-lg tracking-[0.18em] uppercase text-gradient-gold sm:text-xl">
            Forja Serafim
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
          <button
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-gold transition-colors hover:border-gold/60 hover:bg-gold/10"
            aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
            title={isDark ? "Tema claro" : "Tema escuro"}
          >
            <span
              className="inline-flex items-center justify-center transition-transform duration-300"
              style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}
            >
              {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </span>
          </button>
          <a
            href={whatsappLink(
              "Ola! Vim pelo site da Forja Serafim e tenho interesse em proxies full art.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-gold/60 hover:text-gold"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
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
