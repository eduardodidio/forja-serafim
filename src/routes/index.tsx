import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brush, Package, Sparkles, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { PageShell } from "@/components/page-shell";
import { CardTile } from "@/components/card-tile";
import { cards, collections } from "@/lib/store-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Casa do Serafim — Proxies Full Art para Magic: The Gathering" },
      {
        name: "description",
        content:
          "Proxies full art premium e temáticas para Magic: The Gathering. Coleções de Diablo, Castlevania, Dragões, Cyberpunk e muito mais.",
      },
      { property: "og:title", content: "A Casa do Serafim — Proxies Full Art para Magic: The Gathering" },
      {
        property: "og:description",
        content: "Proxies full art premium e temáticas para Magic: The Gathering. Coleções de Diablo, Castlevania, Dragões, Cyberpunk e muito mais.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = collections.slice(0, 6);
  const highlights = cards.filter((_, i) => i % 11 === 0).slice(0, 4);

  return (
    <PageShell>
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
            <span className="text-gradient-gold">A Casa do Serafim</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Proxies Full Art feitas para transformar seu deck em uma verdadeira obra de arte.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/colecoes"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Ver Coleções <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/monte-seu-deck"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-7 py-3.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              Monte seu Deck
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brush, t: "Arte autoral", d: "Cada carta desenhada e diagramada à mão." },
            { icon: Package, t: "Impressão premium", d: "Papel de alta gramatura e acabamento fosco." },
            { icon: Star, t: "Opção foil", d: "Acabamento holográfico sob encomenda." },
            { icon: Sparkles, t: "Decks temáticos", d: "Universos inteiros aplicados ao seu commander." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="surface-card p-6">
              <Icon className="size-5 text-gold" />
              <p className="mt-4 font-display text-base">{t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Coleções</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Universos em papel</h2>
          </div>
          <Link to="/colecoes" className="text-sm text-muted-foreground transition-colors hover:text-gold">
            Ver todas →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <Link
              key={c.slug}
              to="/colecoes/$slug"
              params={{ slug: c.slug }}
              className="art-frame group block bg-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={`Coleção ${c.name}`}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="veil absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-2xl">{c.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
                    {c.cardCount} cartas
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Destaques</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Artes que estão saindo da casa</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((c) => (
            <CardTile key={c.id} card={c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="surface-card flex flex-wrap items-center justify-between gap-6 p-10">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl">Quer uma arte exclusiva?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Criamos projetos sob medida para o seu comandante, com tema, referências e paleta
              definidos junto com você.
            </p>
          </div>
          <Link
            to="/personalizacao"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            Solicitar projeto <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
