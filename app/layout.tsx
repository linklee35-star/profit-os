import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TikTok Shop SEA Profit OS · 跨境电商利润分析",
  description:
    "专业级东南亚跨境电商利润分析系统：真实利润、保本售价、保本 CPA / ROAS、定价与广告测算。关税 · 目标定价 · 双币种 · 最新费率。",
  manifest: "/profit-os/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Profit OS",
  },
  icons: {
    icon: [
      { url: "/profit-os/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/profit-os/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/profit-os/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/profit-os/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
