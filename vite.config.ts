import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function sitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    closeBundle() {
      try {
        const configDir = import.meta.dirname!;
        const collectionsPath = resolve(configDir, "src/data/collections.json");
        const raw = readFileSync(collectionsPath, "utf-8");

        // Check for conflict markers before parsing
        if (raw.includes("<<<<<<<") || raw.includes(">>>>>>>")) {
          console.warn("[sitemap] SKIPPED — collections.json contains merge conflict markers");
          return;
        }

        const collections = JSON.parse(raw) as Array<{
          slug: string;
          hidden: boolean;
        }>;
        const SITE_URL = "https://forjaserafim.com.br";
        const staticRoutes = [
          { loc: "/", priority: "1.0" },
          { loc: "/colecoes", priority: "0.9" },
          { loc: "/sobre", priority: "0.6" },
          { loc: "/contato", priority: "0.6" },
        ];
        const collectionRoutes = collections
          .filter((c) => !c.hidden)
          .map((c) => ({ loc: `/colecoes/${c.slug}`, priority: "0.8" }));
        const allRoutes = [...staticRoutes, ...collectionRoutes];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((r) => `  <url>\n    <loc>${SITE_URL}${r.loc}</loc>\n    <priority>${r.priority}</priority>\n  </url>`).join("\n")}
</urlset>
`;
        writeFileSync(resolve(configDir, "dist/sitemap.xml"), xml);
        console.log("[sitemap] Generated dist/sitemap.xml with", allRoutes.length, "URLs");
      } catch (err) {
        console.warn(
          "[sitemap] SKIPPED — failed to generate sitemap:",
          err instanceof Error ? err.message : err,
        );
      }
    },
  };
}

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_TS": JSON.stringify(String(Date.now())),
  },
  plugins: [TanStackRouterVite(), tailwindcss(), react(), sitemapPlugin()],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  css: { transformer: "lightningcss" },
  server: {
    host: "::",
    port: 8080,
  },
});
