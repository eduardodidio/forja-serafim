import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Brush,
  ClipboardPaste,
  Package,
  Palette,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import hero from "@/assets/hero.jpg";
import { PageShell } from "@/components/page-shell";
import { CollectionCard } from "@/components/card-tile";
import { visibleCollections, testimonials, WHATSAPP_URL, whatsappLink } from "@/lib/store-data";

import { useReveal } from "@/hooks/useReveal";
import { SITE } from "@/lib/seo";

function Reveal({ direction = "up" as "up" | "left" | "right", delay = 0, children, className = "" }: {
  direction?: "up" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, style } = useReveal(direction, delay);
  return <div ref={ref} style={style} className={className}>{children}</div>;
}


export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: `Forja Serafim — Proxies Full Art para MTG` },
      { name: "description", content: SITE.DESCRIPTION },
      { property: "og:title", content: "Forja Serafim — Proxies Full Art para MTG" },
      { property: "og:description", content: SITE.DESCRIPTION },
      { property: "og:image", content: SITE.IMAGE },
      { property: "og:url", content: SITE.URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Forja Serafim — Proxies Full Art para MTG" },
      { name: "twitter:description", content: SITE.DESCRIPTION },
      { name: "twitter:image", content: SITE.IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE.URL }],
  }),
});

function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={hero}
          alt="Cartas full art espalhadas sobre uma mesa escura"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="veil absolute inset-0" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-32">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Proxies full art artesanais</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-gradient-gold">Forja Serafim</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Proxies Full Art feitas para transformar seu deck em uma verdadeira obra de arte.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/colecoes"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Ver Colecoes <ArrowRight className="size-4" />
            </Link>
            <a
              href={whatsappLink("Ola! Vim pelo site da Forja Serafim e gostaria de saber mais sobre as proxies full art.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
            >
              <WhatsAppIcon className="size-4 text-[#25D366]" /> Fale Conosco
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brush, t: "Arte autoral", d: "Cada carta desenhada e diagramada a mao." },
            { icon: Package, t: "Impressao premium", d: "Papel de alta gramatura e acabamento fosco." },
            { icon: Star, t: "Opcao foil", d: "Acabamento holografico sob encomenda." },
            { icon: Sparkles, t: "Decks tematicos", d: "Universos inteiros aplicados ao seu commander." },
          ].map(({ icon: Icon, t, d }, i) => (
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

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Colecoes</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Universos em papel</h2>
          </div>
          <Link to="/colecoes" className="text-sm text-muted-foreground transition-colors hover:text-gold">
            Ver todas &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCollections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 120}>
              <CollectionCard collection={c} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cole sua lista / Escolha seu deck proxy */}
      <DeckListSection />

      {/* Voce escolhe o tema */}
      <ThemeBuilderSection />

      {/* Depoimentos — só exibe quando houver reviews reais */}
      {testimonials.length > 0 && <TestimonialsSection />}

      {/* CTA Final */}
      <Reveal>
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="surface-card flex flex-wrap items-center justify-between gap-6 p-10">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl">Quer encomendar um deck?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Fale diretamente com a gente pelo WhatsApp. Atendemos pedidos personalizados,
              decks completos e artes exclusivas.
            </p>
          </div>
          <a
            href={whatsappLink("Ola! Vim pelo site e quero encomendar um deck de proxies full art. Pode me ajudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
          </a>
        </div>
      </section>
      </Reveal>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Secao: Cole sua lista / Escolha seu deck proxy                    */
/* ------------------------------------------------------------------ */

function DeckListSection() {
  const [list, setList] = useState("");

  const handleSend = () => {
    const msg = encodeURIComponent(
      `Oi! Gostaria de encomendar proxies para a seguinte lista:\n\n${list}`,
    );
    window.open(`${WHATSAPP_URL}?text=${msg}`, "_blank");
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Lado esquerdo — explicacao */}
        <div>
          <div className="flex items-center gap-3">
            <ClipboardPaste className="size-5 text-gold" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Escolha seu deck proxy</p>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl">Cole a lista, nos imprimimos pra voce</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Ja tem sua lista pronta? Cole aqui no formato padrao (1x Card Name) e envie
            direto pelo WhatsApp. Nos cuidamos da arte e da impressao.
          </p>

          <div className="mt-8 space-y-4">
            <div className="surface-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Como importar sua lista</p>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-display text-gold">1.</span>
                  Exporte sua lista do Moxfield, Archidekt ou Deckcheck
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-gold">2.</span>
                  Cole no campo ao lado no formato: 1x Sol Ring
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-gold">3.</span>
                  Clique em enviar — a conversa abre direto no WhatsApp
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-gold">4.</span>
                  Combinamos arte, tema e prazo com voce
                </li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground/60">
              Formatos aceitos: Moxfield export, MTGO format, texto simples (1x Nome da Carta).
              Tambem aceitamos links do Moxfield ou Archidekt direto.
            </p>
          </div>
        </div>

        {/* Lado direito — textarea + botao */}
        <div className="flex flex-col">
          <label htmlFor="decklist" className="text-sm font-medium text-muted-foreground">
            Sua lista de cartas
          </label>
          <textarea
            id="decklist"
            value={list}
            onChange={(e) => setList(e.target.value)}
            rows={14}
            placeholder={`1x Sol Ring\n1x Command Tower\n1x Arcane Signet\n1x Lightning Greaves\n1x Swords to Plowshares\n...\n\nOu cole o link do Moxfield/Archidekt`}
            className="mt-2 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-gold/60"
          />
          <button
            onClick={handleSend}
            disabled={list.trim().length === 0}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> Enviar lista via WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Secao: Voce escolhe o tema, nos fazemos acontecer                 */
/* ------------------------------------------------------------------ */

function ThemeBuilderSection() {
  const [archetype, setArchetype] = useState("");
  const [theme, setTheme] = useState("");
  const [commander, setCommander] = useState("");
  const [notes, setNotes] = useState("");

  const handleSend = () => {
    const parts = [
      `Oi! Quero encomendar um deck personalizado.`,
      commander && `Comandante: ${commander}`,
      archetype && `Arquetipo: ${archetype}`,
      theme && `Tema desejado: ${theme}`,
      notes && `Observacoes: ${notes}`,
    ].filter(Boolean);
    const msg = encodeURIComponent(parts.join("\n"));
    window.open(`${WHATSAPP_URL}?text=${msg}`, "_blank");
  };

  const canSend = theme.trim().length > 0 || commander.trim().length > 0;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="surface-card overflow-hidden lg:grid lg:grid-cols-[1fr_1.2fr]">
        {/* Lado esquerdo — motivacao */}
        <div className="flex flex-col justify-center bg-gradient-to-br from-card to-background p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <Palette className="size-5 text-gold" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Deck personalizado</p>
          </div>
          <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
            Voce escolhe o tema, nos fazemos acontecer
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Quer um deck inteiro de Senhor dos Aneis? Ou um Commander de Zelda?
            Conte pra gente qual e a vibe e nos criamos a arte completa.
          </p>
          <div className="mt-6">
            <img src="/images/logo-forja-serafim.jpg" alt="Forja Serafim" className="size-20 rounded-full object-cover opacity-30" />
          </div>
        </div>

        {/* Lado direito — formulario */}
        <div className="space-y-5 p-8 lg:p-12">
          <div>
            <label htmlFor="commander" className="text-sm font-medium text-muted-foreground">
              Comandante (ou deck)
            </label>
            <input
              id="commander"
              value={commander}
              onChange={(e) => setCommander(e.target.value)}
              placeholder="Ex: Edgar Markov, Atraxa, Omnath..."
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
            />
          </div>

          <div>
            <label htmlFor="archetype" className="text-sm font-medium text-muted-foreground">
              Arquetipo do deck
            </label>
            <select
              id="archetype"
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
            >
              <option value="">Selecione...</option>
              <option value="Aggro">Aggro</option>
              <option value="Control">Control</option>
              <option value="Combo">Combo</option>
              <option value="Midrange">Midrange</option>
              <option value="Stax">Stax</option>
              <option value="Tribal">Tribal</option>
              <option value="Voltron">Voltron</option>
              <option value="Mill">Mill</option>
              <option value="Reanimator">Reanimator</option>
              <option value="Tokens">Tokens</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label htmlFor="theme" className="text-sm font-medium text-muted-foreground">
              Tema desejado
            </label>
            <input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Castlevania, Senhor dos Aneis, Cyberpunk, Zelda..."
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
            />
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
              Observacoes (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Preferencias de cor, estilo de arte, referencias..."
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> Solicitar orcamento via WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Secao: Depoimentos                                                */
/* ------------------------------------------------------------------ */

function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Depoimentos</p>
      <h2 className="mt-3 text-3xl sm:text-4xl">O que dizem nossos clientes</h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
          <div className="surface-card p-7">
            <Quote className="size-5 text-gold/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              "{t.text}"
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-gold/10 font-display text-sm text-gold">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.deck}</p>
              </div>
            </div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
