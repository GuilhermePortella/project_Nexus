import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.NEXT_BASE_PATH || undefined,

  // evita que um aviso novo de lint derrube seu deploy
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
