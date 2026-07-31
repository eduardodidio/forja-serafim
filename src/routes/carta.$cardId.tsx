import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { CardTile } from "@/components/card-tile";
import { brl, cardsOf, FOIL_EXTRA, getCard, getCollection } from "@/lib/store-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/carta/$cardId")({
  loader: ({ params }) => {
    const card = getCard(params.cardId);
    if (!card) throw notFound();
    return { name: card.name, art: card.art };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Carta não encontrada — A Casa do Serafim" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Proxie full art | A Casa do Serafim`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.art.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.art.slice(0, 155) },
      ],
    };
  },
  component: CardPage,
});

function CardPage() {
  const { cardId } = Route.useParams();
  const card = getCard(cardId)!;
  const collection = getCollection(card.collection)!;
  const { add, favorites, toggleFavorite } = useStore();
  const [foil, setFoil] = useState(false);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const price = card.price + (foil ? FOIL_EXTRA : 0);
  const similar = cardsOf(card.collection)
    .filter((c) => c.id !== card.id)
    .slice(0, 4);
  const favorited = favorites.includes(card.id);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Link
          to="/colecoes/$slug"
          params={{ slug: collection.slug }}
          className="text-xs uppercase tracking-[0.25em] text-gold"
        >
          ← {collection.name}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={card.image}
              alt={`Arte full art de ${card.name}`}
              width={900}
              height={1200}
              className="size-full object-cover transition-transform duration-300"
              style={
                zoom
                  ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
            {foil && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,oklch(0.9_0.08_190/0.28)_40%,oklch(0.9_0.1_320/0.25)_55%,transparent_75%)]" />
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{card.type}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{card.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Original: {card.original}</p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{card.art}</p>

            <p className="mt-8 font-display text-4xl text-gold">{brl(price)}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Normal", value: false, hint: "Acabamento fosco premium" },
                { label: "Premium Foil", value: true, hint: `+ ${brl(FOIL_EXTRA)} por carta` },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => setFoil(o.value)}
                  className={cn(
                    "rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-gold/60",
                    foil === o.value && "border-gold bg-gold/10",
                  )}
                >
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{o.hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-9 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Diminuir"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid size-9 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Aumentar"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  add(card.id, foil, qty);
                  toast.success(`${qty}x ${card.name} adicionada ao carrinho`);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="size-4" /> Adicionar ao carrinho
              </button>

              <button
                onClick={() => toggleFavorite(card.id)}
                aria-label="Favoritar"
                className={cn(
                  "grid size-12 place-items-center rounded-full border border-border transition-colors hover:border-gold/60",
                  favorited && "border-accent text-accent",
                )}
              >
                <Heart className={cn("size-4", favorited && "fill-current")} />
              </button>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-2xl sm:text-3xl">Artes semelhantes</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
