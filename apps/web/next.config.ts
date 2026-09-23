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
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: { unoptimized: true },
};

export default withSerwistConfig(nextConfig);
