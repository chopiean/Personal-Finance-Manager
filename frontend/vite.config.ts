import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    // Dev only: forward /api to the local backend so other devices on the
    // network (e.g. a phone opening the --host URL) can use the app.
    // Use it by setting VITE_API_URL=/api (see .env.development.local).
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL ?? "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          // The request now comes from the dev server, not the browser, so
          // drop the browser's Origin to avoid the backend's CORS check
          // rejecting LAN addresses like http://192.168.x.x:5173.
          proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
        },
      },
    },
  },
});
