import { readFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { readJson, writeJson } from "./lib/data-io.js";
import { COLLECTIONS_JSON, TESTIMONIALS_JSON, SETTINGS_JSON, COVERS_DIR, DECKS_DIR, MANUALS_DIR, PROJECT_ROOT } from "./lib/paths.js";
import { toSlug } from "./lib/slug.js";
import { processImage } from "./lib/image-processor.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_HTML = join(__dirname, "..", "public", "index.html");
const PORT = 3001;

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

type Testimonial = {
  name: string;
  text: string;
  deck: string;
};

type Settings = {
  whatsappUrl: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") return cors();

  // Serve admin UI
  if (path === "/" || path === "/admin") {
    return new Response(null, { status: 302, headers: { Location: "/admin/" } });
  }

  if (path === "/admin/" || path === "/admin/index.html") {
    const html = readFileSync(ADMIN_HTML, "utf-8");
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }

  // --- Collections API ---

  if (path === "/api/collections" && method === "GET") {
    return json(readJson<Collection[]>(COLLECTIONS_JSON));
  }

  if (path === "/api/collections" && method === "POST") {
    const body = await req.json() as Partial<Collection>;
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);

    if (!body.name || !body.description || !body.cardCount || body.cardCount <= 0) {
      return json({ error: "Nome, descricao e cardCount (>0) sao obrigatorios." }, 400);
    }

    const slug = toSlug(body.name);
    if (collections.some((c) => c.slug === slug)) {
      return json({ error: `Ja existe colecao com slug "${slug}".` }, 409);
    }

    const newCol: Collection = {
      slug,
      name: body.name,
      image: `/images/covers/${slug}.jpg`,
      description: body.description,
      cardCount: body.cardCount,
      sampleImages: [],
      moxfieldUrl: body.moxfieldUrl ?? "",
      deckcheckUrl: body.deckcheckUrl ?? "",
      manualUrl: "",
    };

    collections.push(newCol);
    writeJson(COLLECTIONS_JSON, collections);
    return json(newCol, 201);
  }

  const colMatch = path.match(/^\/api\/collections\/([^/]+)$/);
  if (colMatch) {
    const slug = colMatch[1]!;
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    const idx = collections.findIndex((c) => c.slug === slug);

    if (idx === -1) return json({ error: "Colecao nao encontrada." }, 404);

    if (method === "PUT") {
      const body = await req.json() as Partial<Collection>;
      const col = collections[idx]!;
      if (body.name !== undefined) col.name = body.name;
      if (body.description !== undefined) col.description = body.description;
      if (body.cardCount !== undefined && body.cardCount > 0) col.cardCount = body.cardCount;
      if (body.moxfieldUrl !== undefined) col.moxfieldUrl = body.moxfieldUrl;
      if (body.deckcheckUrl !== undefined) col.deckcheckUrl = body.deckcheckUrl;
      if (body.sampleImages !== undefined) col.sampleImages = body.sampleImages;
      writeJson(COLLECTIONS_JSON, collections);
      return json(col);
    }

    if (method === "DELETE") {
      const removed = collections.splice(idx, 1)[0]!;
      writeJson(COLLECTIONS_JSON, collections);
      return json(removed);
    }
  }

  // Upload cover
  const coverMatch = path.match(/^\/api\/collections\/([^/]+)\/cover$/);
  if (coverMatch && method === "POST") {
    const slug = coverMatch[1]!;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return json({ error: "Nenhum arquivo enviado." }, 400);

    if (!existsSync(COVERS_DIR)) mkdirSync(COVERS_DIR, { recursive: true });
    const dest = join(COVERS_DIR, `${slug}.jpg`);
    const buffer = Buffer.from(await file.arrayBuffer());
    Bun.write(dest, buffer);
    return json({ path: `/images/covers/${slug}.jpg` });
  }

  // Upload manual PDF
  const manualMatch = path.match(/^\/api\/collections\/([^/]+)\/manual$/);
  if (manualMatch && method === "POST") {
    const slug = manualMatch[1]!;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return json({ error: "Nenhum arquivo enviado." }, 400);
    if (!file.name.toLowerCase().endsWith(".pdf")) return json({ error: "Arquivo deve ser PDF." }, 400);

    if (!existsSync(MANUALS_DIR)) mkdirSync(MANUALS_DIR, { recursive: true });
    const dest = join(MANUALS_DIR, `${slug}.pdf`);
    const buffer = Buffer.from(await file.arrayBuffer());
    Bun.write(dest, buffer);

    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    const col = collections.find((c) => c.slug === slug);
    if (col) {
      col.manualUrl = `/manuals/${slug}.pdf`;
      writeJson(COLLECTIONS_JSON, collections);
    }

    return json({ path: `/manuals/${slug}.pdf` });
  }

  // Upload deck images (process with watermark)
  const imagesMatch = path.match(/^\/api\/collections\/([^/]+)\/images$/);
  if (imagesMatch && method === "POST") {
    const slug = imagesMatch[1]!;
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) return json({ error: "Nenhuma imagem enviada." }, 400);

    const destDir = join(DECKS_DIR, slug);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    const processed: string[] = [];
    const tmpDir = join(destDir, ".tmp-upload");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    for (const file of files) {
      const ext = extname(file.name).toLowerCase();
      if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;

      const baseName = file.name.replace(extname(file.name), "");
      const safeName = baseName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      const tmpPath = join(tmpDir, file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      Bun.write(tmpPath, buffer);

      const outputPath = join(destDir, `${safeName}.jpg`);
      try {
        await processImage(tmpPath, outputPath);
        processed.push(`/images/decks/${slug}/${safeName}.jpg`);
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
      }
    }

    // Clean up tmp
    try {
      const { rmSync } = await import("fs");
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {}

    return json({ processed });
  }

  // --- Testimonials API ---

  if (path === "/api/testimonials" && method === "GET") {
    return json(readJson<Testimonial[]>(TESTIMONIALS_JSON));
  }

  if (path === "/api/testimonials" && method === "POST") {
    const body = await req.json() as Partial<Testimonial>;
    if (!body.name || !body.text) return json({ error: "Nome e texto sao obrigatorios." }, 400);

    const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);
    const t: Testimonial = { name: body.name, text: body.text, deck: body.deck ?? "" };
    testimonials.push(t);
    writeJson(TESTIMONIALS_JSON, testimonials);
    return json(t, 201);
  }

  const testMatch = path.match(/^\/api\/testimonials\/(\d+)$/);
  if (testMatch) {
    const idx = parseInt(testMatch[1]!, 10);
    const testimonials = readJson<Testimonial[]>(TESTIMONIALS_JSON);

    if (idx < 0 || idx >= testimonials.length) return json({ error: "Indice invalido." }, 404);

    if (method === "PUT") {
      const body = await req.json() as Partial<Testimonial>;
      const t = testimonials[idx]!;
      if (body.name !== undefined) t.name = body.name;
      if (body.text !== undefined) t.text = body.text;
      if (body.deck !== undefined) t.deck = body.deck;
      writeJson(TESTIMONIALS_JSON, testimonials);
      return json(t);
    }

    if (method === "DELETE") {
      const removed = testimonials.splice(idx, 1)[0]!;
      writeJson(TESTIMONIALS_JSON, testimonials);
      return json(removed);
    }
  }

  // --- Settings API ---

  if (path === "/api/settings" && method === "GET") {
    return json(readJson<Settings>(SETTINGS_JSON));
  }

  if (path === "/api/settings" && method === "PUT") {
    const body = await req.json() as Partial<Settings>;
    const settings = readJson<Settings>(SETTINGS_JSON);
    if (body.whatsappUrl !== undefined) settings.whatsappUrl = body.whatsappUrl;
    writeJson(SETTINGS_JSON, settings);
    return json(settings);
  }

  // --- Publish (build + commit + push) ---

  if (path === "/api/publish" && method === "POST") {
    const steps: string[] = [];
    const opts = { cwd: PROJECT_ROOT, encoding: "utf-8" as const };

    try {
      // 1. Build
      steps.push("Compilando site...");
      execSync("bun run build", { ...opts, stdio: "pipe" });
      steps.push("Build concluido.");

      // 2. Check if there are changes to commit
      const status = execSync("git status --porcelain", { ...opts, stdio: "pipe" }).trim();
      if (!status) {
        return json({ success: true, steps: [...steps, "Nenhuma alteracao para publicar."] });
      }

      // 3. Stage data files, covers, decks, manuals
      const filesToAdd = [
        "src/data/collections.json",
        "src/data/testimonials.json",
        "src/data/settings.json",
        "public/images/covers/",
        "public/images/decks/",
        "public/manuals/",
      ];
      for (const f of filesToAdd) {
        try {
          execSync(`git add "${f}"`, { ...opts, stdio: "pipe" });
        } catch {}
      }
      steps.push("Arquivos preparados para commit.");

      // 4. Commit
      const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      execSync(`git commit -m "Atualizar site via admin (${now})"`, { ...opts, stdio: "pipe" });
      steps.push("Commit criado.");

      // 5. Push
      execSync("git push origin main", { ...opts, stdio: "pipe" });
      steps.push("Enviado para o servidor. O site sera atualizado em alguns minutos.");

      return json({ success: true, steps });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ success: false, steps: [...steps, `Erro: ${msg}`] }, 500);
    }
  }

  return new Response("Not found", { status: 404 });
}

console.log(`\n  A Casa do Serafim — Admin Web`);
console.log(`  http://localhost:${PORT}/admin/\n`);

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});
