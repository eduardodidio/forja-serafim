import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brush, MessageCircle, Package, Sparkles, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { PageShell } from "@/components/page-shell";
import { CollectionCard } from "@/components/card-tile";
import { collections } from "@/lib/store-data";

const WHATSAPP_URL = "https://wa.me/5551984315964";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
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
              Ver Colecoes <ArrowRight className="size-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-7 py-3.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              <MessageCircle className="size-4" /> Fale Conosco
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brush, t: "Arte autoral", d: "Cada carta desenhada e diagramada a mao." },
            { icon: Package, t: "Impressao premium", d: "Papel de alta gramatura e acabamento fosco." },
            { icon: Star, t: "Opcao foil", d: "Acabamento holografico sob encomenda." },
            { icon: Sparkles, t: "Decks tematicos", d: "Universos inteiros aplicados ao seu commander." },
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
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Colecoes</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Universos em papel</h2>
          </div>
          <Link to="/colecoes" className="text-sm text-muted-foreground transition-colors hover:text-gold">
            Ver todas &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>

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
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
      </section>
    </PageShell>
  );
}
