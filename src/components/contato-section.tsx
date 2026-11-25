import { Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink } from "@/lib/store-data";
import { useReveal } from "@/hooks/useReveal";

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

export function ContatoSection() {
  return (
    <section id="contato" className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Fale conosco</p>
      <h2 className="mt-3 text-3xl sm:text-4xl">Contato</h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        A forma mais rapida de falar com a gente e pelo WhatsApp. Respondemos em ate 24 horas.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal delay={0}>
          <a
            href={whatsappLink(
              "Ola! Vim pela pagina de contato do site e gostaria de falar sobre proxies full art.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex items-center gap-4 p-6 transition-colors hover:border-gold/60"
          >
            <WhatsAppIcon className="size-8 shrink-0 text-[#25D366]" />
            <div>
              <p className="font-display text-base">WhatsApp</p>
              <p className="mt-1 text-sm text-muted-foreground">Clique para conversar</p>
            </div>
          </a>
        </Reveal>
        <Reveal delay={120}>
          <a
            href="https://www.instagram.com/forjaserafim"
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card p-6 transition-colors hover:border-gold/60"
          >
            <Instagram className="size-5 text-gold" />
            <p className="mt-4 font-display text-base">Instagram</p>
            <p className="mt-1 text-sm text-muted-foreground">@forjaserafim</p>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
