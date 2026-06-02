import type { NextConfig } from "next";
import withSerwist from "@serwist/next";
import path from "node:path";

const withSerwistConfig = withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Saída standalone para imagem Docker enxuta.
  output: "standalone",
  // Em monorepo pnpm, o tracing precisa apontar para a raiz para incluir as deps do workspace.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Sem otimização nativa de imagem (dispensa o sharp dentro do container).
  images: { unoptimized: true },
};

export default withSerwistConfig(nextConfig);
