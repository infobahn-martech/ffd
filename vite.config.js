import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/kanbanBoardFE/" : "/",  // build vs dev
  build: {
    outDir: "docs",
  },
}));
