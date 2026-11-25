import collectionsData from "@/data/collections.json";
import testimonialsData from "@/data/testimonials.json";
import settingsData from "@/data/settings.json";
import pricingData from "@/data/pricing.json";

export type Token = {
  image: string;
  name: string;
  quantity: number;
};

export type Collection = {
  slug: string;
  name: string;
  image: string;
  description: string;
  cardCount: number;
  sampleImages: string[];
  tokens: Token[];
  moxfieldUrl: string;
  deckcheckUrl: string;
  manualUrl: string;
  videoUrl: string;
  hidden: boolean;
};

export type Testimonial = {
  name: string;
  text: string;
  deck: string;
};

export type PricingProduct = {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  standardPrice: number;
  foilPrice: number | null;
  unit: string;
  highlight: boolean;
  visible: boolean;
  order: number;
};

export type ShippingRegion = {
  region: string;
  states: string[];
  pacPrice: number;
  pacDays: string;
  sedexPrice: number;
  sedexDays: string;
};

export type PricingData = {
  products: PricingProduct[];
  notes: string[];
  shippingRegions: ShippingRegion[];
};

export const collections: Collection[] = collectionsData;
export const visibleCollections: Collection[] = collectionsData.filter((c) => !c.hidden);
export const testimonials: Testimonial[] = testimonialsData as Testimonial[];
export const WHATSAPP_URL: string = settingsData.whatsappUrl;
export const pricing: PricingData = pricingData as PricingData;
export const pricingProducts: PricingProduct[] = pricingData.products as PricingProduct[];
export const shippingRegions: ShippingRegion[] = pricingData.shippingRegions as ShippingRegion[];
export const pricingNotes: string[] = pricingData.notes;
const settings = settingsData as {
  whatsappUrl: string;
  originCep?: string;
  originAddress?: string;
};
export const originCep: string = settings.originCep || "";
export const originAddress: string = settings.originAddress || "";

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function whatsappLink(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
