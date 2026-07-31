import { createFileRoute } from "@tanstack/react-router";
import { Brush, HeartHandshake, Printer, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { DISCLAIMER } from "@/components/site-footer";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Casa do Serafim — Proxies artesanais de Magic" },
      {
        name: "description",
        content:
          "A história da Casa do Serafim: paixão por Magic: The Gathering e o desejo de transformar cada deck em uma obra de arte única.",
      },
      { property: "og:title", content: "Sobre a Casa do Serafim" },
      {
        property: "og:description",
        content: "Qualidade, criatividade, impressão premium e atendimento personalizado.",
      },
    ],
  }),
  component: Sobre,
});

const values = [
  { icon: ShieldCheck, t: "Qualidade", d: "Revisão de cor e nitidez em cada carta antes do envio." },
  { icon: Brush, t: "Criatividade", d: "Composições autorais inspiradas em universos que amamos." },
  { icon: Printer, t: "Impressão Premium", d: "Papel de alta gramatura, acabamento fosco ou foil." },
  { icon: HeartHandshake, t: "Atendimento Personalizado", d: "Acompanhamento direto do início ao envio." },
];

function Sobre() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Nossa história</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Sobre</h1>

        <p className="mt-8 font-display text-xl leading-relaxed text-gradient-gold">
          A Casa do Serafim nasceu da paixão por Magic: The Gathering e pelo desejo de transformar
          cada deck em uma obra de arte única.
        </p>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Tudo começou em mesas de Commander, entre amigos, quando percebemos que um deck conta
            uma história — e que essa história merece uma identidade visual à altura. Passamos a
            desenhar cartas inspiradas nos universos que moldaram nossa imaginação: o inferno de
            Diablo, a noite eterna de Castlevania, as armaduras douradas do Zodíaco, os cristais de
            Final Fantasy, as ruas neon do cyberpunk.
          </p>
          <p>
            Hoje cada arte passa por composição manual, tratamento de cor e diagramação própria
            antes de ir para a impressão premium. Nada é automático: da moldura ao tipo de papel,
            tudo é escolhido para que a carta pareça uma peça de coleção nas suas mãos.
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
