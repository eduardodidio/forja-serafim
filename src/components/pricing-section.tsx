import {
  Swords,
  Palette,
  Layers,
  PenTool,
  Package,
  Gem,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { pricingProducts, pricingNotes, whatsappLink } from "@/lib/store-data";
import { useReveal } from "@/hooks/useReveal";

const iconMap: Record<string, LucideIcon> = {
  Swords,
  Palette,
  Layers,
  PenTool,
  Package,
  Gem,
  Sparkles,
};

function Reveal({
  direction = "up" as "up" | "left" | "right",
  delay = 0,
  children,
  className = "",
}: {
  direction?: "up" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, style } = useReveal(direction, delay);
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

function formatPrice(price: number, unit: string): string {
  return `R$ ${price}${unit !== "deck" ? `/${unit}` : ""}`;
}

export function PricingSection() {
  const visible = pricingProducts.filter((p) => p.visible).sort((a, b) => a.order - b.order);

  if (visible.length === 0) return null;

  return (
    <section id="valores" className="mx-auto max-w-7xl px-5 py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Valores</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Invista no seu deck</h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
          Proxies full art com qualidade premium. Escolha o formato ideal para o seu jogo.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product, i) => {
          const Icon = iconMap[product.icon] || Sparkles;
          return (
            <Reveal key={product.id} delay={i * 120}>
              <div
                className={`surface-card relative flex h-full flex-col p-6 ${
                  product.highlight ? "ring-1 ring-gold/40" : ""
                }`}
              >
                {product.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Popular
                  </span>
                )}
                <Icon className="size-5 text-gold" />
                <p className="mt-4 font-display text-base">{product.label}</p>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {product.subtitle}
                </p>
                <div className="mt-5 border-t border-border/50 pt-4">
                  <p className="text-2xl font-display">
                    {formatPrice(product.standardPrice, product.unit)}
                  </p>
                  <p className="text-xs text-muted-foreground">Padrao</p>
                  {product.foilPrice !== null && (
                    <div className="mt-2">
                      <p className="text-lg font-display text-gold">
                        {formatPrice(product.foilPrice, product.unit)}
                      </p>
                      <p className="text-xs text-muted-foreground">Foil holografico</p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Notes */}
      {pricingNotes.length > 0 && (
        <div className="mt-8 mx-auto max-w-3xl">
          <ul className="space-y-1.5">
            {pricingNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground/70">
                <span className="text-gold/50">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 text-center">
        <a
          href={whatsappLink("Ola! Vi os valores no site e gostaria de fazer um pedido.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
        >
          <WhatsAppIcon className="size-4 text-[#25D366]" /> Faca seu pedido
        </a>
      </div>
    </section>
  );
}
