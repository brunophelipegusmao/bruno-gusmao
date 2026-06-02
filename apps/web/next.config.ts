import type { NextConfig } from "next";
import withSerwist from "@serwist/next";
import path from "node:path";

const withSerwistConfig = withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

// URL interna do container API (usada no servidor Next.js para o rewrite de auth).
// Em desenvolvimento aponta direto para localhost.
const apiUrl = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: { unoptimized: true },
  // Proxy de auth: as chamadas /api/auth/* passam pelo Next.js e chegam à API
  // com o domínio brunogusmao.dev — sem problemas de cookie cross-subdomain.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default withSerwistConfig(nextConfig);
