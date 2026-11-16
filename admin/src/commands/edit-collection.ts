import { select, input, number } from "@inquirer/prompts";
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

export async function editCollection(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao editar?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const col = collections.find((c) => c.slug === slug)!;

  const field = await select({
    message: "Qual campo editar?",
    choices: [
      { name: `Nome (${col.name})`, value: "name" as const },
      { name: `Descricao (${col.description})`, value: "description" as const },
      { name: `Qtd cartas (${col.cardCount})`, value: "cardCount" as const },
    ],
  });

  if (field === "name") {
    const val = await input({ message: "Novo nome:", default: col.name });
    col.name = val;
  } else if (field === "description") {
    const val = await input({ message: "Nova descricao:", default: col.description });
    col.description = val;
  } else if (field === "cardCount") {
    const val = await number({ message: "Nova quantidade:", default: col.cardCount });
    if (!val || val <= 0) {
      console.log("  Erro: quantidade deve ser positiva.");
      return;
    }
    col.cardCount = val;
  }

  writeJson(COLLECTIONS_JSON, collections);
  console.log(`  Colecao "${col.name}" atualizada.`);
}
