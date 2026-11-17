import { select, confirm } from "@inquirer/prompts";
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

export async function removeCollection(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao remover?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const col = collections.find((c) => c.slug === slug)!;
  const ok = await confirm({
    message: `Tem certeza que deseja remover "${col.name}"?`,
    default: false,
  });

  if (!ok) {
    console.log("  Cancelado.");
    return;
  }

  const filtered = collections.filter((c) => c.slug !== slug);
  writeJson(COLLECTIONS_JSON, filtered);
  console.log(`  Colecao "${col.name}" removida.`);
  console.log(`  Nota: imagens e manual nao foram removidos automaticamente.`);
}
