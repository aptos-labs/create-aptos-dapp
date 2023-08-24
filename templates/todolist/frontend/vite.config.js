import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    define: {
      "process.env": {},
    },
    server: {
      open: true,
    },
    plugins: [react()],
  };
});
