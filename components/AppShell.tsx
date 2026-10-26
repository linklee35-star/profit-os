"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Boxes,
  FileSpreadsheet,
  Settings,
  Sun,
  Moon,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { useSkuStore } from "@/store/useSkuStore";
import { useEffectiveRate } from "@/hooks/useProfit";
import { countries, getCountry } from "@/lib/countries";
import { formatRate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PwaRegister } from "@/components/PwaRegister";
import { InstallBanner } from "@/components/InstallBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "利润分析", icon: LayoutDashboard },
  { href: "/sku-library", label: "SKU 成本库", icon: Boxes },
  { href: "/batch-test", label: "批量测品", icon: FileSpreadsheet },
  { href: "/settings", label: "设置", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ModeToggle() {
  const mode = useSettingsStore((s) => s.mode);
  const setMode = useSettingsStore((s) => s.setMode);
  return (
    <div className="flex items-center rounded-lg bg-muted p-0.5 text-xs font-medium">
      <button
        onClick={() => setMode("quick")}
        className={cn(
          "rounded-md px-2.5 py-1 transition-colors",
          mode === "quick" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        快速估算
      </button>
      <button
        onClick={() => setMode("real")}
        className={cn(
          "rounded-md px-2.5 py-1 transition-colors",
          mode === "real" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        真实利润
      </button>
    </div>
  );
}

function CountrySelect() {
  const countryCode = useSettingsStore((s) => s.countryCode);
  const setCountry = useSettingsStore((s) => s.setCountry);
  return (
    <Select value={countryCode} onValueChange={(v) => setCountry(v as typeof countryCode)}>
      <SelectTrigger className="h-8 w-[120px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.flag} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="切换主题"
    >
      {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function RateIndicator() {
  const rate = useEffectiveRate();
  const country = getCountry(useSettingsStore((s) => s.countryCode));
  const autoRate = useSettingsStore((s) => s.autoRate);
  const rateSource = useSettingsStore((s) => s.rateSource);
  return (
    <Link
      href="/settings"
      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent"
      title="汇率设置"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          rateSource === "auto" && autoRate != null
            ? "bg-[hsl(var(--success))]"
            : "bg-muted-foreground",
        )}
      />
      <span className="tabular-nums">
        1 CNY = <span className="font-semibold">{formatRate(rate)}</span> {country.currency}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  // 首屏用默认值渲染（与服务端一致），挂载后再从 LocalStorage 恢复，避免 hydration 不匹配
  React.useEffect(() => {
    useInputStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useSkuStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <PwaRegister />
      <InstallBanner />
      {/* 侧边栏（桌面端） */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Profit OS</p>
            <p className="text-[10px] text-muted-foreground">TikTok Shop SEA</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" /> 跨境电商利润分析
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <ModeToggle />
          <CountrySelect />
          <div className="ml-auto flex items-center gap-2">
            <RateIndicator />
            <ThemeToggle />
          </div>
        </header>

        {/* 移动端导航 */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden no-scrollbar">
          <NavLinks />
        </div>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
