import { input, number, confirm } from "@inquirer/prompts";
import { readJson, writeJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON } from "../lib/paths.js";
import { toSlug } from "../lib/slug.js";

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

export async function addCollection(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  const name = await input({ message: "Nome da colecao:" });
  const slug = toSlug(name);

  if (collections.some((c) => c.slug === slug)) {
    console.log(`  Erro: ja existe uma colecao com slug "${slug}".`);
    return;
  }

  const description = await input({ message: "Descricao curta:" });
  const cardCount = await number({ message: "Quantidade de cartas:", default: 100 });

  if (!cardCount || cardCount <= 0) {
    console.log("  Erro: quantidade de cartas deve ser positiva.");
    return;
  }

  const ok = await confirm({ message: `Adicionar "${name}" (slug: ${slug})?` });
  if (!ok) {
    console.log("  Cancelado.");
    return;
  }

  const newCollection: Collection = {
    slug,
    name,
    image: `/images/covers/${slug}.jpg`,
    description,
    cardCount,
    sampleImages: [],
    moxfieldUrl: "",
    deckcheckUrl: "",
    manualUrl: "",
  };

  collections.push(newCollection);
  writeJson(COLLECTIONS_JSON, collections);
  console.log(`  Colecao "${name}" adicionada com sucesso!`);
  console.log(`  Proximo passo: use "Definir capa" e "Processar imagens".`);
}
