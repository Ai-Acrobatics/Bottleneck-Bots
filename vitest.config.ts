import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot),
      "@/server": path.resolve(templateRoot, "server"),
      "@/client": path.resolve(templateRoot, "client", "src"),
      "@/drizzle": path.resolve(templateRoot, "drizzle"),
      "@/__tests__": path.resolve(templateRoot, "client", "src", "__tests__"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    globals: true,
  },
});
