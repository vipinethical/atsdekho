import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["unpdf", "@react-pdf/renderer"],
};

export default nextConfig;
