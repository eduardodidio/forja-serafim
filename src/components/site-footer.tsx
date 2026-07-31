import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Gamepad2 } from "lucide-react";

export const DISCLAIMER =
  "Este projeto não é afiliado à Wizards of the Coast. Magic: The Gathering e seus respectivos nomes são marcas registradas de seus proprietários. As proxies produzidas destinam-se exclusivamente ao uso casual, colecionismo e personalização artística, não sendo válidas para torneios oficiais.";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-[oklch(0.19_0.012_265)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="min-w-0">
          <p className="font-display text-lg tracking-[0.18em] uppercase text-gradient-gold">
            A Casa do Serafim
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Proxies full art feitas à mão para jogadores casuais, Commander e colecionadores.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: MessageCircle, label: "WhatsApp" },
              { icon: Gamepad2, label: "Discord" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:border-gold/60 hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Navegue</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              { to: "/", label: "Home" },
              { to: "/colecoes", label: "Coleções" },
              { to: "/monte-seu-deck", label: "Monte seu Deck" },
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
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Atendimento</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Seg a sex · 10h às 19h</li>
            <li>contato@casadoserafim.com</li>
            <li>Envio para todo o Brasil</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">{DISCLAIMER}</p>
          <p className="mt-3 text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} A Casa do Serafim. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
