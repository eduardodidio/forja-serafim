import { collections, WHATSAPP_URL } from "./store-data";

const SITE_URL = "https://forjaserafim.com.br";
const SITE_NAME = "Forja Serafim";
const DEFAULT_DESCRIPTION =
  "Proxies Full Art artesanais para Magic: The Gathering. Decks tematicos completos com arte autoral premium.";
const DEFAULT_IMAGE = `${SITE_URL}/images/covers/castlevania.jpg`;

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

export const SITE = {
  URL: SITE_URL,
  NAME: SITE_NAME,
  DESCRIPTION: DEFAULT_DESCRIPTION,
  IMAGE: DEFAULT_IMAGE,
};
