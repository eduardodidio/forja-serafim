import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { brl, getCard } from "@/lib/store-data";
import { unitPrice, useStore } from "@/lib/store";

export const SHIPPING = 24.9;
export const COUPONS: Record<string, number> = { SERAFIM10: 0.1, FULLART15: 0.15 };

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — A Casa do Serafim" },
      { name: "description", content: "Revise suas proxies full art antes de finalizar o pedido." },
      { property: "og:title", content: "Carrinho — A Casa do Serafim" },
      { property: "og:description", content: "Revise suas proxies full art antes de finalizar o pedido." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, ready } = useStore();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = items.length ? SHIPPING : 0;
  const total = subtotal - subtotal * discount + shipping;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 py-16">
        <h1 className="text-4xl sm:text-5xl">Carrinho</h1>

        {!ready ? (
          <div className="mt-10 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card mt-10 p-12 text-center">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              to="/colecoes"
              className="mt-6 inline-flex rounded-full bg-gold px-7 py-3 text-sm font-medium text-primary-foreground"
            >
              Explorar coleções
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => {
                const card = getCard(item.cardId);
                if (!card) return null;
                const unit = unitPrice(item.cardId, item.foil);
                return (
                  <div
                    key={`${item.cardId}-${item.foil}`}
                    className="surface-card grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      loading="lazy"
                      width={900}
                      height={1200}
                      className="aspect-[3/4] w-full rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        to="/carta/$cardId"
                        params={{ cardId: card.id }}
                        className="truncate font-display text-base hover:text-gold"
                      >
                        {card.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.foil ? "Premium Foil" : "Normal"} · {brl(unit)} un.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full border border-border p-1">
                          <button
                            onClick={() => setQty(item.cardId, item.foil, item.qty - 1)}
                            className="grid size-7 place-items-center rounded-full hover:bg-secondary"
                            aria-label="Diminuir"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.cardId, item.foil, item.qty + 1)}
                            className="grid size-7 place-items-center rounded-full hover:bg-secondary"
                            aria-label="Aumentar"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.cardId, item.foil)}
                          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <p className="col-span-2 text-right font-display text-lg text-gold sm:col-span-1">
                      {brl(unit * item.qty)}
                    </p>
                  </div>
                );
              })}
            </div>

            <aside className="surface-card h-fit p-6">
              <p className="font-display text-lg">Resumo</p>

              <div className="mt-5 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold/60"
                />
                <button
                  onClick={() => {
                    const d = COUPONS[coupon];
                    if (d) {
                      setDiscount(d);
                      toast.success(`Cupom aplicado: ${d * 100}% de desconto`);
                    } else {
                      setDiscount(0);
                      toast.error("Cupom inválido");
                    }
                  }}
                  className="shrink-0 rounded-full border border-gold/50 px-5 text-sm text-gold hover:bg-gold/10"
                >
                  Aplicar
                </button>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{brl(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gold">
                    <dt>Desconto</dt>
                    <dd>-{brl(subtotal * discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd>{brl(shipping)}</dd>
                </div>
                <div className="hairline flex justify-between pt-4 font-display text-xl">
                  <dt>Total</dt>
                  <dd className="text-gold">{brl(total)}</dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-7 flex w-full items-center justify-center rounded-full bg-gold py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Finalizar Pedido
              </Link>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}
