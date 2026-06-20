import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // basePath and assetPrefix are only needed for GitHub Pages.
  // When building for Tauri, these must be empty.
  ...(isGitHubPages && {
    basePath: "/FlowState",
    assetPrefix: "/FlowState",
  }),
};

export default nextConfig;
