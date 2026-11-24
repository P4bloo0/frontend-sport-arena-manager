// esto permite abrir el proyecto con npm run dev
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { accesoDemo } from "./tools/accesoDemo.js";
export default defineConfig({
  plugins: [react(), accesoDemo()],
  server: { host: "localhost" },
  preview: { host: "localhost" },
});
