import { select, input, checkbox } from "@inquirer/prompts";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { readJson, writeJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON, DECKS_DIR } from "../lib/paths.js";
import { processImage } from "../lib/image-processor.js";

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

export async function processImages(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  if (collections.length === 0) {
    console.log("  Nenhuma colecao cadastrada.");
    return;
  }

  const slug = await select({
    message: "Qual colecao?",
    choices: collections.map((c) => ({ name: `${c.name} (${c.slug})`, value: c.slug })),
  });

  const inputDir = await input({ message: "Caminho da pasta com imagens originais:" });

  if (!existsSync(inputDir)) {
    console.log(`  Erro: pasta "${inputDir}" nao encontrada.`);
    return;
  }

  const files = readdirSync(inputDir).filter((f) => {
    const ext = extname(f).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
  });

  if (files.length === 0) {
    console.log("  Nenhuma imagem encontrada na pasta.");
    return;
  }

  const destDir = join(DECKS_DIR, slug);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  console.log(`  Processando ${files.length} imagens...`);

  const processedFiles: string[] = [];

  for (const file of files) {
    const inputPath = join(inputDir, file);
    const baseName = file.replace(extname(file), "");
    const safeName = baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const outputPath = join(destDir, `${safeName}.jpg`);

    try {
      await processImage(inputPath, outputPath);
      processedFiles.push(safeName);
      console.log(`    OK: ${file} -> ${safeName}.jpg`);
    } catch (err) {
      console.error(`    FAIL: ${file} - ${err}`);
    }
  }

  if (processedFiles.length === 0) {
    console.log("  Nenhuma imagem processada com sucesso.");
    return;
  }

  const samples = await checkbox({
    message: "Selecione as imagens que serao amostras no site:",
    choices: processedFiles.map((f) => ({
      name: f,
      value: `/images/decks/${slug}/${f}.jpg`,
    })),
  });

  const col = collections.find((c) => c.slug === slug)!;
  col.sampleImages = samples;
  writeJson(COLLECTIONS_JSON, collections);

  console.log(`  ${processedFiles.length} imagens processadas. ${samples.length} selecionadas como amostra.`);
}
