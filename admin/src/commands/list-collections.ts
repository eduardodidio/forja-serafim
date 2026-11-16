import { readJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON } from "../lib/paths.js";

type Collection = {
  slug: string;
  name: string;
  cardCount: number;
  deckcheckUrl: string;
  moxfieldUrl: string;
  manualUrl: string;
};

export async function listCollections(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  console.log();
  console.log("  Slug                     | Nome                   | Cartas | DeckCheck | Moxfield | Manual");
  console.log("  " + "-".repeat(95));

  for (const c of collections) {
    const slug = c.slug.padEnd(25);
    const name = c.name.padEnd(23);
    const cards = String(c.cardCount).padEnd(7);
    const dc = c.deckcheckUrl ? "sim" : "---";
    const mox = c.moxfieldUrl ? "sim" : "---";
    const manual = c.manualUrl ? "sim" : "---";
    console.log(`  ${slug}| ${name}| ${cards}| ${dc.padEnd(10)}| ${mox.padEnd(9)}| ${manual}`);
  }

  console.log();
}
