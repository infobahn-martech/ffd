

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ["@mui/material", "@mui/x-date-pickers", "@emotion/react", "@emotion/styled"],
          tiptap: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-color",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-text-align",
            "@tiptap/extension-text-style",
            "@tiptap/extension-underline",
          ],
          quill: ["quill", "quill-table-better", "react-quill", "react-quill-new"],
          pdf: ["pdfjs-dist"],
          dates: ["moment", "dayjs", "date-fns"],
          msal: ["@azure/msal-browser", "@azure/msal-react"],
          bootstrap: ["bootstrap", "react-bootstrap"],
        },
      },
    },
  },
});