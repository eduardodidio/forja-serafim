import collectionsData from "@/data/collections.json";
import testimonialsData from "@/data/testimonials.json";
import settingsData from "@/data/settings.json";

export type Collection = {
  slug: string;
  name: string;
  image: string;
  description: string;
  cardCount: number;
  sampleImages: string[];
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

export const collections: Collection[] = collectionsData;
export const visibleCollections: Collection[] = collectionsData.filter((c) => !c.hidden);
export const testimonials: Testimonial[] = testimonialsData as Testimonial[];
export const WHATSAPP_URL: string = settingsData.whatsappUrl;

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function whatsappLink(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
