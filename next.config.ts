import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true, // 👈 habilita <Image> sem API de otimização
  },
};

export default nextConfig;