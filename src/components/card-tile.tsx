import type { Collection } from "@/lib/store-data";
import { Link } from "@tanstack/react-router";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      to="/colecoes/$slug"
      params={{ slug: collection.slug }}
      className="art-frame group block bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={collection.image}
          alt={`Colecao ${collection.name}`}
          loading="lazy"
          width={900}
          height={1200}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="veil absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="font-display text-2xl">{collection.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
            {collection.cardCount} cartas
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
