import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, FileText } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { PageShell } from "@/components/page-shell";
import { Card3DTilt } from "@/components/card-3d-tilt";
import { Lightbox } from "@/components/lightbox";
import { getCollection, whatsappLink } from "@/lib/store-data";
import { getProductJsonLd, getBreadcrumbJsonLd, SITE } from "@/lib/seo";

export const Route = createFileRoute("/colecoes/$slug")({
  component: CollectionPage,
  head: ({ params }) => {
    const c = getCollection(params.slug);
    if (!c) return {};
    const image = c.image.startsWith("http") ? c.image : `${SITE.URL}${c.image}`;
    return {
      meta: [
        { title: `${c.name} — Deck Proxy Full Art | ${SITE.NAME}` },
        { name: "description", content: `${c.description} ${c.cardCount} cartas com arte autoral premium.` },
        { property: "og:title", content: `${c.name} — Deck Proxy Full Art` },
        { property: "og:description", content: c.description },
        { property: "og:image", content: image },
        { property: "og:url", content: `${SITE.URL}/colecoes/${c.slug}` },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${c.name} — Deck Proxy Full Art` },
        { name: "twitter:description", content: c.description },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: `${SITE.URL}/colecoes/${c.slug}` },
      ],
    };
  },
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const collection = getCollection(slug);
  const navigate = useNavigate();

  if (!collection) {
    navigate({ to: "/colecoes" });
    return null;
  }

  const whatsappHref = whatsappLink(
    `Oi! Vim pelo site e tenho interesse no deck ${collection.name} da Forja Serafim. Pode me passar mais detalhes?`,
  );

  const productJsonLd = getProductJsonLd(slug);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: SITE.URL },
    { name: "Colecoes", url: `${SITE.URL}/colecoes` },
    { name: collection.name, url: `${SITE.URL}/colecoes/${slug}` },
  ]);

  return (
    <PageShell>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
            <Lightbox images={collection.sampleImages} alt={`Amostra da colecao ${collection.name}`}>
              {(openLightbox) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collection.sampleImages.map((img, i) => (
                    <Card3DTilt key={i} foil gold className="cursor-pointer overflow-hidden bg-card">
                      <div
                        onClick={() => openLightbox(i)}
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
                    </Card3DTilt>
                  ))}
                </div>
              )}
            </Lightbox>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Imagens ilustrativas com marca d'agua. As cartas finais possuem qualidade superior.
            </p>
          </div>
        )}

        {/* Deck reference link + manual */}
        {(collection.deckcheckUrl || collection.moxfieldUrl || collection.manualUrl) && (
          <div className="mb-12 space-y-6">
            {collection.deckcheckUrl && (
              <div className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Deck referencia</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confira a lista completa de cartas deste deck no DeckCheck antes de encomendar.
                </p>
                <a
                  href={collection.deckcheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <ExternalLink className="size-4" /> Confira o deck referencia aqui
                </a>
              </div>
            )}

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

            {collection.manualUrl && (
              <div className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Manual do deck</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Baixe o guia completo com estrategias, combos e dicas de como pilotar este deck.
                </p>
                <a
                  href={collection.manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <FileText className="size-4" /> Baixar manual do deck (PDF)
                </a>
              </div>
            )}
          </div>
        )}

        <div className="surface-card flex flex-wrap items-center justify-between gap-6 p-10">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl">Quer esse deck?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Fale com a gente pelo WhatsApp para encomendar este deck completo
              ou tirar qualquer duvida.
            </p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> Encomendar via WhatsApp
          </a>
        </div>
      </div>
    </PageShell>
  );
}
