import { select, input } from "@inquirer/prompts";
import { readJson, writeJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON } from "../lib/paths.js";

type Collection = {
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

function isValidUrl(url: string): boolean {
  return url === "" || /^https?:\/\/.+/.test(url);
}

export async function setUrl(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const col = collections.find((c) => c.slug === slug)!;

  const urlType = await select({
    message: "Qual URL definir?",
    choices: [
      { name: `DeckCheck (atual: ${col.deckcheckUrl || "vazio"})`, value: "deckcheckUrl" as const },
      { name: `Moxfield (atual: ${col.moxfieldUrl || "vazio"})`, value: "moxfieldUrl" as const },
    ],
  });

  const url = await input({
    message: `URL do ${urlType === "deckcheckUrl" ? "DeckCheck" : "Moxfield"} (vazio para limpar):`,
    default: col[urlType],
  });

  if (!isValidUrl(url)) {
    console.log("  Erro: URL deve comecar com http:// ou https://");
    return;
  }

  col[urlType] = url;
  writeJson(COLLECTIONS_JSON, collections);
  console.log(`  URL ${urlType === "deckcheckUrl" ? "DeckCheck" : "Moxfield"} atualizada.`);
}
