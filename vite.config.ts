import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const HUB = "http://localhost:8787";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": { target: HUB, changeOrigin: true },
      "/ws": { target: HUB, ws: true, changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
