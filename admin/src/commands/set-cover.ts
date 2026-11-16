import { select, input } from "@inquirer/prompts";
import { existsSync, copyFileSync } from "fs";
import { join } from "path";
import { readJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON, COVERS_DIR } from "../lib/paths.js";

type Collection = {
  slug: string;
  name: string;
};

export async function setCover(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const imagePath = await input({ message: "Caminho da imagem de capa:" });

  if (!existsSync(imagePath)) {
    console.log(`  Erro: arquivo "${imagePath}" nao encontrado.`);
    return;
  }

  const dest = join(COVERS_DIR, `${slug}.jpg`);
  copyFileSync(imagePath, dest);
  console.log(`  Capa copiada para ${dest}`);
}
