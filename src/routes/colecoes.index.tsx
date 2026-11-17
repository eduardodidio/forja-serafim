import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionCard } from "@/components/card-tile";
import { visibleCollections } from "@/lib/store-data";
import { SITE } from "@/lib/seo";

export const Route = createFileRoute("/colecoes/")({
  component: Colecoes,
  head: () => ({
    meta: [
      { title: `Colecoes | ${SITE.NAME}` },
      { name: "description", content: "Catalogo completo de decks proxy full art tematicos. Cada colecao com identidade visual propria e acabamento premium." },
      { property: "og:title", content: "Colecoes" },
      { property: "og:description", content: "Catalogo completo de decks proxy full art tematicos." },
      { property: "og:image", content: SITE.IMAGE },
      { property: "og:url", content: `${SITE.URL}/colecoes` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Colecoes" },
      { name: "twitter:description", content: "Catalogo completo de decks proxy full art tematicos." },
      { name: "twitter:image", content: SITE.IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE.URL}/colecoes` },
    ],
  }),
});

function Colecoes() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Catalogo</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Colecoes</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada colecao e desenvolvida artesanalmente com identidade visual propria, moldura autoral
          e acabamento premium.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCollections.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
