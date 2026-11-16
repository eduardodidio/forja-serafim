import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionCard } from "@/components/card-tile";
import { collections } from "@/lib/store-data";

export const Route = createFileRoute("/colecoes/")({
  component: Colecoes,
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
          {collections.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
