import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los paquetes internos se publican como código TypeScript fuente.
  transpilePackages: ["@rexaedu/ui", "@rexaedu/themes"],
};

export default nextConfig;
