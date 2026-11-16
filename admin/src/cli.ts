import { select } from "@inquirer/prompts";

import { listCollections } from "./commands/list-collections.js";
import { addCollection } from "./commands/add-collection.js";
import { editCollection } from "./commands/edit-collection.js";
import { removeCollection } from "./commands/remove-collection.js";
import { processImages } from "./commands/process-images.js";
import { setCover } from "./commands/set-cover.js";
import { setUrl } from "./commands/set-url.js";
import { uploadManual } from "./commands/upload-manual.js";
import { manageTestimonials } from "./commands/manage-testimonials.js";

async function main() {
  console.log("\n  A Casa do Serafim — Admin CLI\n");

  while (true) {
    const action = await select({
      message: "O que deseja fazer?",
      choices: [
        { name: "Listar colecoes", value: "list" },
        { name: "Adicionar colecao", value: "add" },
        { name: "Editar colecao", value: "edit" },
        { name: "Remover colecao", value: "remove" },
        { name: "Processar imagens", value: "images" },
        { name: "Definir capa", value: "cover" },
        { name: "Definir URL (DeckCheck/Moxfield)", value: "url" },
        { name: "Upload manual (PDF)", value: "manual" },
        { name: "Gerenciar depoimentos", value: "testimonials" },
        { name: "Sair", value: "exit" },
      ],
    });

    switch (action) {
      case "list": await listCollections(); break;
      case "add": await addCollection(); break;
      case "edit": await editCollection(); break;
      case "remove": await removeCollection(); break;
      case "images": await processImages(); break;
      case "cover": await setCover(); break;
      case "url": await setUrl(); break;
      case "manual": await uploadManual(); break;
      case "testimonials": await manageTestimonials(); break;
      case "exit": console.log("Ate mais!"); process.exit(0);
    }

    console.log();
  }
}

main().catch((err) => {
  if (err instanceof Error && err.message.includes("User force closed")) {
    console.log("\nAte mais!");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
