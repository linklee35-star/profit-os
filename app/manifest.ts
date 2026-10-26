import type { MetadataRoute } from "next";

// GitHub Pages 项目页部署在 /profit-os 子路径，manifest 内所有 URL 需带前缀
const BASE = "/profit-os";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TikTok Shop SEA Profit OS",
    short_name: "Profit OS",
    description: "东南亚跨境电商利润分析系统 · 关税 · 目标定价 · 实时汇率",
    start_url: `${BASE}/`,
    scope: BASE,
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    orientation: "any",
    id: "profit-os-v2",
    icons: [
      {
        src: `${BASE}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BASE}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${BASE}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
