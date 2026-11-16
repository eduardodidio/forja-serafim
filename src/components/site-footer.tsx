import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5551984315964";

export const DISCLAIMER =
  "Este projeto nao e afiliado a Wizards of the Coast. Magic: The Gathering e seus respectivos nomes sao marcas registradas de seus proprietarios. As proxies produzidas destinam-se exclusivamente ao uso casual, colecionismo e personalizacao artistica, nao sendo validas para torneios oficiais.";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-[oklch(0.19_0.012_265)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="min-w-0">
          <p className="font-display text-lg tracking-[0.18em] uppercase text-gradient-gold">
            A Casa do Serafim
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Proxies full art feitas a mao para jogadores casuais, Commander e colecionadores.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/60 hover:text-gold"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Instagram className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Navegue</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              { to: "/", label: "Home" },
              { to: "/colecoes", label: "Colecoes" },
              { to: "/sobre", label: "Sobre" },
              { to: "/contato", label: "Contato" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Contato</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold"
              >
                WhatsApp
              </a>
            </li>
            <li>Envio para todo o Brasil</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">{DISCLAIMER}</p>
          <p className="mt-3 text-[11px] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} A Casa do Serafim. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
