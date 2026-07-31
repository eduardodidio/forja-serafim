import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { brl, type ProxyCard } from "@/lib/store-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CardTile({ card }: { card: ProxyCard }) {
  const { add, favorites, toggleFavorite } = useStore();
  const favorited = favorites.includes(card.id);

  return (
    <article className="art-frame group bg-card">
      <Link to="/carta/$cardId" params={{ cardId: card.id }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={card.image}
            alt={`Proxie full art ${card.name}`}
            loading="lazy"
            width={900}
            height={1200}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <div className="veil pointer-events-none absolute inset-0" />
          <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-gold">
            {card.type}
          </span>
        </div>
      </Link>

      <div className="relative z-10 space-y-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base">{card.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{card.original}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg text-gold">{brl(card.price)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(card.id)}
              aria-label="Favoritar"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/60",
                favorited && "border-accent text-accent",
              )}
            >
              <Heart className={cn("size-4", favorited && "fill-current")} />
            </button>
            <button
              onClick={() => {
                add(card.id, false);
                toast.success(`${card.name} adicionada ao carrinho`);
              }}
              aria-label="Adicionar ao carrinho"
              className="inline-flex size-9 items-center justify-center rounded-full bg-gold text-primary-foreground transition-transform hover:scale-105"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
