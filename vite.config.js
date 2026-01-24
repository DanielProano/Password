import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import config from "./src/config.json";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: parseInt(config.port) || 5173,
    watch: {
      usePolling: true,
    },
  },
});
