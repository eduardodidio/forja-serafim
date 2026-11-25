import { Brush, HeartHandshake, Printer, ShieldCheck } from "lucide-react";
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

const values = [
  {
    icon: ShieldCheck,
    t: "Qualidade",
    d: "Revisao de cor e nitidez em cada carta antes do envio.",
  },
  {
    icon: Brush,
    t: "Criatividade",
    d: "Composicoes autorais inspiradas em universos que amamos.",
  },
  {
    icon: Printer,
    t: "Impressao Premium",
    d: "Papel de alta gramatura, acabamento fosco ou foil.",
  },
  {
    icon: HeartHandshake,
    t: "Atendimento Personalizado",
    d: "Acompanhamento direto do inicio ao envio.",
  },
];

export function SobreSection() {
  return (
    <section id="sobre" className="mx-auto max-w-7xl px-5 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Nossa historia</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Sobre</h2>

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
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 100}>
            <div className="surface-card p-6 h-full">
              <Icon className="size-5 text-gold" />
              <p className="mt-4 font-display text-base">{t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
