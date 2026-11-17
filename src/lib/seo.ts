import { collections, WHATSAPP_URL } from "./store-data";

const SITE_URL = "https://forjaserafim.com.br";
const SITE_NAME = "Forja Serafim";
const DEFAULT_DESCRIPTION =
  "Proxies Full Art artesanais para Magic: The Gathering. Decks tematicos completos com arte autoral premium.";
const DEFAULT_IMAGE = `${SITE_URL}/images/covers/castlevania.jpg`;

export type MetaTags = {
  title: string;
  description: string;
  url: string;
  image: string;
  type?: string;
};

export function getMetaTags(page: MetaTags) {
  return [
    { title: `${page.title} | ${SITE_NAME}` },
    { name: "description", content: page.description },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:image", content: page.image },
    { property: "og:url", content: page.url },
    { property: "og:type", content: page.type || "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "pt_BR" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: page.image },
  ];
}

export function getHomeMetaTags() {
  return getMetaTags({
    title: "Forja Serafim — Proxies Full Art para MTG",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: DEFAULT_IMAGE,
  });
}

export function getCollectionMetaTags(slug: string) {
  const c = collections.find((col) => col.slug === slug);
  if (!c) return getHomeMetaTags();
  return getMetaTags({
    title: `${c.name} — Deck Proxy Full Art`,
    description: `${c.description} ${c.cardCount} cartas com arte autoral premium.`,
    url: `${SITE_URL}/colecoes/${c.slug}`,
    image: c.image.startsWith("http") ? c.image : `${SITE_URL}${c.image}`,
    type: "product",
  });
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: WHATSAPP_URL,
      availableLanguage: "Portuguese",
    },
    sameAs: [],
  };
}

export function getProductJsonLd(slug: string) {
  const c = collections.find((col) => col.slug === slug);
  if (!c) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${c.name} — Deck Proxy Full Art`,
    description: c.description,
    image: c.image.startsWith("http") ? c.image : `${SITE_URL}${c.image}`,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "BRL",
      url: `${SITE_URL}/colecoes/${c.slug}`,
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateSitemap() {
  const staticRoutes = [
    { loc: "/", priority: "1.0" },
    { loc: "/colecoes", priority: "0.9" },
    { loc: "/sobre", priority: "0.6" },
    { loc: "/contato", priority: "0.6" },
  ];

  const collectionRoutes = collections.map((c) => ({
    loc: `/colecoes/${c.slug}`,
    priority: "0.8",
  }));

  const allRoutes = [...staticRoutes, ...collectionRoutes];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((r) => `  <url>
    <loc>${SITE_URL}${r.loc}</loc>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

export const SITE = { URL: SITE_URL, NAME: SITE_NAME, DESCRIPTION: DEFAULT_DESCRIPTION, IMAGE: DEFAULT_IMAGE };
