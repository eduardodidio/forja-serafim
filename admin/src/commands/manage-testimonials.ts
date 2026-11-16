import { select, input } from "@inquirer/prompts";
import { readJson, writeJson } from "../lib/data-io.js";
import { COLLECTIONS_JSON, TESTIMONIALS_JSON } from "../lib/paths.js";

type Testimonial = {
  name: string;
  text: string;
  deck: string;
};

type Collection = {
  slug: string;
  name: string;
};

export async function manageTestimonials(): Promise<void> {
  const action = await select({
    message: "Depoimentos:",
    choices: [
      { name: "Listar", value: "list" },
      { name: "Adicionar", value: "add" },
      { name: "Editar", value: "edit" },
      { name: "Remover", value: "remove" },
      { name: "Voltar", value: "back" },
    ],
  });

  switch (action) {
    case "list": await listTestimonials(); break;
    case "add": await addTestimonial(); break;
    case "edit": await editTestimonial(); break;
    case "remove": await removeTestimonial(); break;
  }
}

async function listTestimonials(): Promise<void> {
  const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);

  if (testimonials.length === 0) {
    console.log("  Nenhum depoimento cadastrado.");
    return;
  }

  console.log();
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i]!;
    console.log(`  [${i + 1}] ${t.name} — ${t.deck}`);
    console.log(`      "${t.text}"`);
  }
  console.log();
}

async function addTestimonial(): Promise<void> {
  const collections = readJson<Collection[]>(COLLECTIONS_JSON);

  const name = await input({ message: "Nome do cliente:" });
  const text = await input({ message: "Texto do depoimento:" });

  let deck = "";
  if (collections.length > 0) {
    deck = await select({
      message: "Deck associado:",
      choices: [
        ...collections.map((c) => ({ name: c.name, value: c.name })),
        { name: "(nenhum)", value: "" },
      ],
    });
  }

  const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);
  testimonials.push({ name, text, deck });
  writeJson(TESTIMONIALS_JSON, testimonials);

  console.log(`  Depoimento de "${name}" adicionado.`);
}

async function editTestimonial(): Promise<void> {
  const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);

  if (testimonials.length === 0) {
    console.log("  Nenhum depoimento cadastrado.");
    return;
  }

  const idx = await select({
    message: "Qual depoimento editar?",
    choices: testimonials.map((t, i) => ({
      name: `[${i + 1}] ${t.name} — "${t.text.slice(0, 50)}..."`,
      value: i,
    })),
  });

  const t = testimonials[idx]!;

  const field = await select({
    message: "Qual campo editar?",
    choices: [
      { name: `Nome (${t.name})`, value: "name" as const },
      { name: `Texto`, value: "text" as const },
      { name: `Deck (${t.deck})`, value: "deck" as const },
    ],
  });

  if (field === "name") {
    t.name = await input({ message: "Novo nome:", default: t.name });
  } else if (field === "text") {
    t.text = await input({ message: "Novo texto:", default: t.text });
  } else {
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    t.deck = await select({
      message: "Deck associado:",
      choices: [
        ...collections.map((c) => ({ name: c.name, value: c.name })),
        { name: "(nenhum)", value: "" },
      ],
    });
  }

  writeJson(TESTIMONIALS_JSON, testimonials);
  console.log(`  Depoimento atualizado.`);
}

async function removeTestimonial(): Promise<void> {
  const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);

  if (testimonials.length === 0) {
    console.log("  Nenhum depoimento cadastrado.");
    return;
  }

  const idx = await select({
    message: "Qual depoimento remover?",
    choices: testimonials.map((t, i) => ({
      name: `[${i + 1}] ${t.name} — "${t.text.slice(0, 50)}..."`,
      value: i,
    })),
  });

  const removed = testimonials.splice(idx, 1)[0]!;
  writeJson(TESTIMONIALS_JSON, testimonials);
  console.log(`  Depoimento de "${removed.name}" removido.`);
}
