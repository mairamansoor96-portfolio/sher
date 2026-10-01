import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: no server, `next build` writes the site to out/.
  output: "export",
};

export default nextConfig;
