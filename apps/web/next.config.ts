import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withSerwistConfig = withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withSerwistConfig(nextConfig);
