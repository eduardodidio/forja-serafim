import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getCollection } from "@/lib/store-data";

const WHATSAPP_URL = "https://wa.me/5551984315964";

export const Route = createFileRoute("/colecoes/$slug")({
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const collection = getCollection(slug);
  const navigate = useNavigate();

  if (!collection) {
    navigate({ to: "/colecoes" });
    return null;
  }

  const whatsappMessage = encodeURIComponent(
    `Oi! Tenho interesse no deck ${collection.name} da Casa do Serafim. Pode me passar mais detalhes?`,
  );

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border/70">
        <img
          src={collection.image}
          alt={`Colecao ${collection.name}`}
          width={900}
          height={1200}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="veil absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20">
          <Link to="/colecoes" className="text-xs uppercase tracking-[0.25em] text-gold">
            &larr; Colecoes
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
        {collection.sampleImages.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl">Amostra do deck</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collection.sampleImages.map((img, i) => (
                <div
                  key={i}
                  className="art-frame overflow-hidden bg-card"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={img}
                    alt={`Amostra ${i + 1} da colecao ${collection.name}`}
                    loading="lazy"
                    width={600}
                    height={840}
                    className="size-full object-cover"
                    style={{
                      userSelect: "none",
                      WebkitUserDrag: "none",
                      pointerEvents: "none",
                    } as React.CSSProperties}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Imagens ilustrativas com marca d'agua. As cartas finais possuem qualidade superior.
            </p>
          </div>
        )}

        <div className="mb-12 flex flex-wrap gap-4">
          {collection.moxfieldUrl && (
            <a
              href={collection.moxfieldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-gold/60 hover:text-gold"
            >
              <ExternalLink className="size-4" /> Ver no Moxfield
            </a>
          )}
          {collection.deckcheckUrl && (
            <a
              href={collection.deckcheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-gold/60 hover:text-gold"
            >
              <ExternalLink className="size-4" /> Ver no Deckcheck
            </a>
          )}
        </div>

        <div className="surface-card flex flex-wrap items-center justify-between gap-6 p-10">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl">Quer esse deck?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Fale com a gente pelo WhatsApp para encomendar este deck completo
              ou tirar qualquer duvida.
            </p>
          </div>
          <a
            href={`${WHATSAPP_URL}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" /> Encomendar via WhatsApp
          </a>
        </div>
      </div>
    </PageShell>
  );
}
