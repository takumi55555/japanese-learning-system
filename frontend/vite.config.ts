/// <reference types="node" />
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  // Domain configuration
  const backendDomain = process.env.VITE_BACKEND_DOMAIN || "manabou.co.jp";
  const frontendDomain = process.env.VITE_FRONTEND_DOMAIN || "manabou.co.jp";

  // HMR configuration - use same port as server to avoid permission issues
  const hmrPort = process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : 5173;
  const hmrConfig = {
    host: isDev ? "localhost" : frontendDomain,
    port: hmrPort,
    protocol: isDev ? "ws" as const : "wss" as const,
    clientPort: hmrPort,
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,

      // Allow production domain(s) and localhost
      allowedHosts: ["www.manabou.co.jp", "manabou.co.jp", "localhost"],

      // HMR configuration
      hmr: hmrConfig,

      // API proxy configuration
      proxy: {
        "/api": {
          target: isDev ? "http://localhost:4000" : `https://${backendDomain}`,
          changeOrigin: true,
          secure: !isDev,
        },
      },
    },
  };
});
