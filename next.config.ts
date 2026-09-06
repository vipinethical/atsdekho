import type { NextConfig } from "next";

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "") || "https://us.i.posthog.com";
const posthogAssets = posthogHost.includes("eu.")
  ? "https://eu-assets.i.posthog.com"
  : "https://us-assets.i.posthog.com";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["unpdf", "@react-pdf/renderer"],
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssets}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
};

export default nextConfig;
