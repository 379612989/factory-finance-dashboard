import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: "/factory-finance-dashboard",
        assetPrefix: "/factory-finance-dashboard/",
        images: {
          unoptimized: true,
        },
      }
    : {}),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
