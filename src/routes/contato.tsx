import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { PageShell } from "@/components/page-shell";
import { whatsappLink } from "@/lib/store-data";

export const Route = createFileRoute("/contato")({
  component: Contato,
});

function Contato() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Fale conosco</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Contato</h1>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          A forma mais rapida de falar com a gente e pelo WhatsApp.
          Respondemos em ate 24 horas.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={whatsappLink("Ola! Vim pela pagina de contato do site e gostaria de falar sobre proxies full art.")}
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
          <a
            href="#"
            className="surface-card p-6 transition-colors hover:border-gold/60"
          >
            <Instagram className="size-5 text-gold" />
            <p className="mt-4 font-display text-base">Instagram</p>
            <p className="mt-1 text-sm text-muted-foreground">@casadoserafim</p>
          </a>
        </div>
      </div>
    </PageShell>
  );
}
