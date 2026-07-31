import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { collections } from "@/lib/store-data";

export const Route = createFileRoute("/colecoes")({
  head: () => ({
    meta: [
      { title: "Coleções temáticas — A Casa do Serafim" },
      {
        name: "description",
        content:
          "Explore as coleções full art da Casa do Serafim: Diablo, Castlevania, Cavaleiros do Zodíaco, Final Fantasy, Dragões, Cyberpunk e mais.",
      },
      { property: "og:title", content: "Coleções temáticas — A Casa do Serafim" },
      {
        property: "og:description",
        content: "Universos famosos transformados em proxies full art para o seu deck.",
      },
    ],
  }),
  component: Colecoes,
});

function Colecoes() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Catálogo</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Coleções</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada coleção é desenvolvida artesanalmente com identidade visual própria, moldura autoral
          e acabamento premium.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
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
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
