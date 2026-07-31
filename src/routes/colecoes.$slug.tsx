import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { CardTile } from "@/components/card-tile";
import { CARD_TYPES, cardsOf, getCollection } from "@/lib/store-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/colecoes/$slug")({
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { name: collection.name, description: collection.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Coleção não encontrada — A Casa do Serafim" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Coleção full art | A Casa do Serafim`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const collection = getCollection(slug)!;
  const all = cardsOf(slug);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("Todas");

  const filtered = useMemo(
    () =>
      all.filter(
        (c) =>
          (type === "Todas" || c.type === type) &&
          (c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.original.toLowerCase().includes(query.toLowerCase())),
      ),
    [all, query, type],
  );

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={collection.image}
          alt={`Coleção ${collection.name}`}
          width={900}
          height={1200}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="veil absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20">
          <Link to="/colecoes" className="text-xs uppercase tracking-[0.25em] text-gold">
            ← Coleções
          </Link>
          <h1 className="mt-5 text-4xl sm:text-6xl">{collection.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold">
            {collection.cardCount} cartas
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-gold/60"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todas", ...CARD_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-gold/60 hover:text-gold",
                  type === t && "border-gold bg-gold/10 text-gold",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Nenhuma carta encontrada com esses filtros.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
