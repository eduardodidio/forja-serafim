import { readFileSync, existsSync, mkdirSync, copyFileSync, statSync, unlinkSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { readJson, writeJson } from "./lib/data-io.js";
import { COLLECTIONS_JSON, TESTIMONIALS_JSON, SETTINGS_JSON, COVERS_DIR, DECKS_DIR, MANUALS_DIR, PROJECT_ROOT } from "./lib/paths.js";
import { toSlug } from "./lib/slug.js";
import { processImage } from "./lib/image-processor.js";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_HTML = join(__dirname, "..", "public", "index.html");
const LOGIN_HTML = join(__dirname, "..", "public", "login.html");
const PORT = parseInt(process.env.PORT || "3001", 10);

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

// In-memory session store (resets on deploy — user just logs in again)
const sessions = new Map<string, { email: string; expires: number }>();

function createSession(email: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { email, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days
  return token;
}

function getSession(req: Request): string | null {
  const cookie = req.headers.get("Cookie") || "";
  const match = cookie.match(/serafim_session=([a-f0-9]+)/);
  if (!match) return null;
  const token = match[1];
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session.email;
}

function isAuthEnabled(): boolean {
  return GOOGLE_CLIENT_ID !== "" && ALLOWED_EMAILS.length > 0;
}

async function verifyGoogleToken(credential: string): Promise<string | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!res.ok) return null;
    const data = await res.json() as { email?: string; aud?: string; email_verified?: string };
    if (data.aud !== GOOGLE_CLIENT_ID) return null;
    if (data.email_verified !== "true") return null;
    return data.email?.toLowerCase() || null;
  } catch {
    return null;
  }
}

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
  hidden: boolean;
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

  // --- Auth routes (always accessible) ---

  // Login page
  if (path === "/login" || path === "/login/") {
    if (!isAuthEnabled()) {
      return new Response(null, { status: 302, headers: { Location: "/admin/" } });
    }
    const html = existsSync(LOGIN_HTML)
      ? readFileSync(LOGIN_HTML, "utf-8").replace("__GOOGLE_CLIENT_ID__", GOOGLE_CLIENT_ID)
      : `<html><body>Login page not found. Set GOOGLE_CLIENT_ID.</body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }

  // Google auth callback
  if (path === "/auth/google" && method === "POST") {
    const body = await req.json() as { credential?: string };
    if (!body.credential) return json({ error: "Missing credential" }, 400);

    const email = await verifyGoogleToken(body.credential);
    if (!email) return json({ error: "Token invalido" }, 401);
    if (!ALLOWED_EMAILS.includes(email)) {
      return json({ error: `Email ${email} nao autorizado` }, 403);
    }

    const token = createSession(email);
    return new Response(JSON.stringify({ ok: true, email }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `serafim_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${url.protocol === "https:" ? "; Secure" : ""}`,
      },
    });
  }

  // Logout
  if (path === "/auth/logout") {
    const cookie = req.headers.get("Cookie") || "";
    const match = cookie.match(/serafim_session=([a-f0-9]+)/);
    if (match) sessions.delete(match[1]);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
        "Set-Cookie": "serafim_session=; Path=/; Max-Age=0",
      },
    });
  }

  // --- Auth gate: only protect /admin and /api routes ---
  if (isAuthEnabled() && (path.startsWith("/admin") || path.startsWith("/api/"))) {
    const email = getSession(req);
    if (!email) {
      if (path.startsWith("/api/")) {
        return json({ error: "Nao autenticado" }, 401);
      }
      return new Response(null, { status: 302, headers: { Location: "/login" } });
    }
  }

  // Serve admin UI
  if (path === "/admin") {
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
      hidden: body.hidden ?? false,
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
      if (body.hidden !== undefined) col.hidden = body.hidden;
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

  // Reorder sample images
  const reorderMatch = path.match(/^\/api\/collections\/([^/]+)\/images\/reorder$/);
  if (reorderMatch && method === "PUT") {
    const slug = reorderMatch[1]!;
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    const col = collections.find((c) => c.slug === slug);
    if (!col) return json({ error: "Colecao nao encontrada." }, 404);

    const body = await req.json() as { sampleImages?: string[] };
    if (!body.sampleImages || !Array.isArray(body.sampleImages)) {
      return json({ error: "sampleImages deve ser um array." }, 400);
    }

    // Validate all paths exist in current array
    const currentSet = new Set(col.sampleImages);
    for (const img of body.sampleImages) {
      if (!currentSet.has(img)) {
        return json({ error: `Imagem "${img}" nao encontrada na colecao.` }, 400);
      }
    }

    col.sampleImages = body.sampleImages;
    writeJson(COLLECTIONS_JSON, collections);
    return json(col);
  }

  // Delete a sample image
  const imageDeleteMatch = path.match(/^\/api\/collections\/([^/]+)\/images\/([^/]+)$/);
  if (imageDeleteMatch && method === "DELETE") {
    const slug = imageDeleteMatch[1]!;
    const filename = imageDeleteMatch[2]!;
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    const col = collections.find((c) => c.slug === slug);
    if (!col) return json({ error: "Colecao nao encontrada." }, 404);

    const imagePath = `/images/decks/${slug}/${filename}`;
    const idx = col.sampleImages.indexOf(imagePath);
    if (idx === -1) return json({ error: "Imagem nao encontrada na colecao." }, 404);

    // Remove from array
    col.sampleImages.splice(idx, 1);
    writeJson(COLLECTIONS_JSON, collections);

    // Delete physical file
    const physicalPath = join(DECKS_DIR, slug, filename);
    try {
      if (existsSync(physicalPath)) unlinkSync(physicalPath);
    } catch (err) {
      console.error(`Failed to delete file ${physicalPath}:`, err);
    }

    return json(col);
  }

  // Upload deck images (process with watermark)
  const imagesMatch = path.match(/^\/api\/collections\/([^/]+)\/images$/);
  if (imagesMatch && method === "POST") {
    const slug = imagesMatch[1]!;
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) return json({ error: "Nenhuma imagem enviada." }, 400);

    // Validate limit of 6 sample images
    const collections = readJson<Collection[]>(COLLECTIONS_JSON);
    const col = collections.find((c) => c.slug === slug);
    if (col && col.sampleImages.length + files.length > 6) {
      return json({ error: "Maximo de 6 imagens de amostra por colecao." }, 400);
    }

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

      // 2. Stage data files, covers, decks, manuals
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

      // 3. Check if there are staged changes to commit
      const diff = execSync("git diff --cached --name-only", { ...opts, stdio: "pipe" }).trim();
      if (diff) {
        const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        execSync(`git commit -m "Atualizar site via admin (${now})"`, { ...opts, stdio: "pipe" });
        steps.push("Alteracoes salvas: " + diff.split("\n").join(", "));
      } else {
        steps.push("Dados ja estavam salvos.");
      }

      // 4. Push (always push, in case there are unpushed commits)
      const ahead = execSync("git rev-list --count @{u}..HEAD", { ...opts, stdio: "pipe" }).trim();
      if (ahead !== "0") {
        execSync("git push origin main", { ...opts, stdio: "pipe" });
        steps.push("Enviado para o GitHub.");
      } else {
        steps.push("Codigo ja estava no GitHub.");
      }

      // 5. Trigger Render deploy
      const deployHook = process.env.RENDER_DEPLOY_HOOK;
      if (deployHook) {
        try {
          const hookRes = await fetch(deployHook, { method: "POST" });
          if (hookRes.ok) {
            steps.push("Deploy disparado no Render! O site sera atualizado em alguns minutos.");
          } else {
            const hookBody = await hookRes.text().catch(() => "");
            console.error(`Render deploy hook failed: ${hookRes.status} ${hookRes.statusText} — ${hookBody}`);
            steps.push(`Aviso: deploy hook retornou status ${hookRes.status}. Verifique se o RENDER_DEPLOY_HOOK esta correto.`);
          }
        } catch (hookErr) {
          console.error("Render deploy hook error:", hookErr);
          steps.push("Aviso: erro de rede ao disparar deploy. Verifique o RENDER_DEPLOY_HOOK.");
        }
      } else {
        steps.push("Aviso: RENDER_DEPLOY_HOOK nao configurado. Configure no Render para deploys automaticos.");
      }

      return json({ success: true, steps });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ success: false, steps: [...steps, `Erro: ${msg}`] }, 500);
    }
  }

  // --- Serve static files ---
  const MIME_TYPES: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xml": "application/xml",
    ".txt": "text/plain",
  };

  // Try dist/ first (built site), then public/ (raw assets)
  const DIST_DIR = join(PROJECT_ROOT, "dist");
  for (const baseDir of [DIST_DIR, join(PROJECT_ROOT, "public")]) {
    const filePath = join(baseDir, path.slice(1));
    if (existsSync(filePath) && !filePath.includes("..") && statSync(filePath).isFile()) {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] ?? "application/octet-stream";
      const file = readFileSync(filePath);
      const headers: Record<string, string> = { "Content-Type": mime };
      if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".woff", ".woff2"].includes(ext)) {
        headers["Cache-Control"] = "public, max-age=31536000, immutable";
      }
      return new Response(file, { headers });
    }
  }

  // SPA fallback — serve index.html for non-API/non-admin routes
  const indexHtml = join(DIST_DIR, "index.html");
  if (!path.startsWith("/api/") && !path.startsWith("/admin") && existsSync(indexHtml)) {
    const file = readFileSync(indexHtml);
    return new Response(file, { headers: { "Content-Type": "text/html" } });
  }

  return new Response("Not found", { status: 404 });
}

// Configure git for remote server (needed for commit/push on Render)
if (process.env.GITHUB_TOKEN) {
  try {
    const remote = execSync("git remote get-url origin", { cwd: PROJECT_ROOT, encoding: "utf-8" }).trim();
    if (remote.startsWith("https://") && !remote.includes("@")) {
      const authedRemote = remote.replace("https://", `https://${process.env.GITHUB_TOKEN}@`);
      execSync(`git remote set-url origin "${authedRemote}"`, { cwd: PROJECT_ROOT, encoding: "utf-8" });
    }
    try { execSync("git config user.email", { cwd: PROJECT_ROOT, stdio: "pipe" }); } catch {
      execSync('git config user.email "admin@forjaserafim.com.br"', { cwd: PROJECT_ROOT });
      execSync('git config user.name "Serafim Admin"', { cwd: PROJECT_ROOT });
    }
  } catch {}
}

console.log(`\n  Forja Serafim — Admin Web`);
console.log(`  http://localhost:${PORT}/admin/`);
console.log(`  Auth: ${isAuthEnabled() ? `Google OAuth (${ALLOWED_EMAILS.join(", ")})` : "DISABLED (local dev)"}\n`);

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});
