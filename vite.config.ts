import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

console.log("BUILD ENV CHECK:", {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? "DEFINED" : "UNDEFINED",
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "DEFINED" : "UNDEFINED",
  SUPABASE_URL: process.env.SUPABASE_URL ? "DEFINED" : "UNDEFINED",
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ? "DEFINED" : "UNDEFINED",
});

export default defineConfig({
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ""),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || ""),
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
    nitro({
      preset: "vercel",
    }),
  ],
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          input: "./src/server.ts",
        },
      },
    },
  },
});
