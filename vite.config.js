import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local dev = "/", Production build = "/kanbanBoardFE/"
  base: command === "build" ? "/kanbanBoardFE/" : "/",
}));
