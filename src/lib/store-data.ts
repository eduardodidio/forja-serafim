import collectionsData from "@/data/collections.json";
import testimonialsData from "@/data/testimonials.json";

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
};

export type Testimonial = {
  name: string;
  text: string;
  deck: string;
};

export const collections: Collection[] = collectionsData;
export const testimonials: Testimonial[] = testimonialsData as Testimonial[];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
