import { createFileRoute } from "@tanstack/react-router";
import { Brush, HeartHandshake, Printer, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { DISCLAIMER } from "@/components/site-footer";
import { SITE } from "@/lib/seo";

export const Route = createFileRoute("/sobre")({
  component: Sobre,
  head: () => ({
    meta: [
      { title: `Sobre | ${SITE.NAME}` },
      { name: "description", content: "Conheca a historia da Forja Serafim. Proxies full art artesanais para Magic: The Gathering, feitas com paixao e identidade visual unica." },
      { property: "og:title", content: "Sobre a Forja Serafim" },
      { property: "og:description", content: "Conheca a historia da Forja Serafim. Proxies full art artesanais para MTG." },
      { property: "og:image", content: SITE.IMAGE },
      { property: "og:url", content: `${SITE.URL}/sobre` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sobre a Forja Serafim" },
      { name: "twitter:description", content: "Conheca a historia da Forja Serafim. Proxies full art artesanais para MTG." },
      { name: "twitter:image", content: SITE.IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE.URL}/sobre` },
    ],
  }),
});

const values = [
  { icon: ShieldCheck, t: "Qualidade", d: "Revisao de cor e nitidez em cada carta antes do envio." },
  { icon: Brush, t: "Criatividade", d: "Composicoes autorais inspiradas em universos que amamos." },
  { icon: Printer, t: "Impressao Premium", d: "Papel de alta gramatura, acabamento fosco ou foil." },
  { icon: HeartHandshake, t: "Atendimento Personalizado", d: "Acompanhamento direto do inicio ao envio." },
];

function Sobre() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Nossa historia</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Sobre</h1>

        <p className="mt-8 font-display text-xl leading-relaxed text-gradient-gold">
          A Forja Serafim nasceu da paixao por Magic: The Gathering e pelo desejo de transformar
          cada deck em uma obra de arte unica.
        </p>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Tudo comecou em mesas de Commander, entre amigos, quando percebemos que um deck conta
            uma historia — e que essa historia merece uma identidade visual a altura. Passamos a
            desenhar cartas inspiradas nos universos que moldaram nossa imaginacao: a noite eterna
            de Castlevania, as armaduras douradas do Zodiaco, os cristais de Final Fantasy e muito
            mais.
          </p>
          <p>
            Hoje cada arte passa por composicao manual, tratamento de cor e diagramacao propria
            antes de ir para a impressao premium. Nada e automatico: da moldura ao tipo de papel,
            tudo e escolhido para que a carta pareca uma peca de colecao nas suas maos.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, t, d }) => (
            <div key={t} className="surface-card p-6">
              <Icon className="size-5 text-gold" />
              <p className="mt-4 font-display text-base">{t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <p className="hairline mt-14 pt-6 text-xs leading-relaxed text-muted-foreground/70">
          {DISCLAIMER}
        </p>
      </div>
    </PageShell>
  );
}
