import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TikTok Shop SEA Profit OS",
    short_name: "Profit OS",
    description: "东南亚跨境电商利润分析系统 · 关税 · 目标定价 · 实时汇率",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    orientation: "any",
    id: "profit-os-v2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
