import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_TS": JSON.stringify(String(Date.now())),
  },
  plugins: [TanStackRouterVite(), tailwindcss(), react()],
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
