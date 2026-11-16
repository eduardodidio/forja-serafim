import { select, input } from "@inquirer/prompts";
import { existsSync, copyFileSync } from "fs";
import { join } from "path";
import { readJson, writeJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON, MANUALS_DIR } from "../lib/paths.js";

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

export async function uploadManual(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const pdfPath = await input({ message: "Caminho do arquivo PDF:" });

  if (!existsSync(pdfPath)) {
    console.log(`  Erro: arquivo "${pdfPath}" nao encontrado.`);
    return;
  }

  if (!pdfPath.toLowerCase().endsWith(".pdf")) {
    console.log("  Erro: arquivo deve ser um PDF.");
    return;
  }

  const dest = join(MANUALS_DIR, `${slug}.pdf`);
  copyFileSync(pdfPath, dest);

  const col = collections.find((c) => c.slug === slug)!;
  col.manualUrl = `/manuals/${slug}.pdf`;
  writeJson(COLLECTIONS_JSON, collections);

  console.log(`  Manual copiado para ${dest}`);
  console.log(`  URL do manual atualizada para /manuals/${slug}.pdf`);
}
