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
  Calculator,
} from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useInputStore } from "@/store/useInputStore";
import { useSkuStore } from "@/store/useSkuStore";
import { useEffectiveRate } from "@/hooks/useProfit";
import { getCountry } from "@/lib/countries";
import { feeData } from "@/lib/fees";
import { getPlatform, platforms } from "@/lib/platforms";
import { formatRate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PwaRegister } from "@/components/PwaRegister";
import { InstallBanner } from "@/components/InstallBanner";
import { ShareButton } from "@/components/ShareButton";
import { decodeShareState, readShareToken, stripShareParam } from "@/lib/share";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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

const markets = feeData.map(({ platform, country }) => ({
  value: `${platform}:${country}`,
  platform,
  country: getCountry(country),
}));

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="主导航" className="flex gap-1 whitespace-nowrap md:flex-col">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
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
          mode === "quick" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        快速估算
      </button>
      <button
        onClick={() => setMode("real")}
        className={cn(
          "rounded-md px-2.5 py-1 transition-colors",
          mode === "real" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        真实利润
      </button>
    </div>
  );
}

function MarketSelect() {
  const platformId = useSettingsStore((s) => s.platformId);
  const countryCode = useSettingsStore((s) => s.countryCode);
  const setMarket = useSettingsStore((s) => s.setMarket);
  const selected = markets.find((m) => m.platform === platformId && m.country.code === countryCode);

  return (
    <Select
      value={selected?.value ?? ""}
      onValueChange={(value) => {
        const market = markets.find((m) => m.value === value);
        if (market) setMarket(market.country.code, market.platform);
      }}
    >
      <SelectTrigger className="h-9 w-full gap-2 border-border bg-card px-3 text-sm font-medium shadow-none lg:w-[205px]" aria-label="销售站点">
        <SelectValue placeholder="选择销售站点">
          {selected ? `${getPlatform(platformId).name} · ${selected.country.name}站` : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="w-[230px]">
        {platforms.map((platform) => (
          <SelectGroup key={platform.id} className="border-b border-border px-1 py-1.5 last:border-0">
            <SelectLabel className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
              {platform.name}
            </SelectLabel>
            {markets.filter((market) => market.platform === platform.id).map(({ value, country }) => (
              <SelectItem key={value} value={value} textValue={`${platform.name} ${country.name}站`}>
                <span className="flex items-center gap-2">
                  {country.name}站
                  <span className="text-xs tabular-nums text-muted-foreground">{country.currency}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
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
    Promise.resolve(useInputStore.persist.rehydrate())
      .then(() =>
        Promise.all([
          useSettingsStore.persist.rehydrate(),
          useSkuStore.persist.rehydrate(),
        ]),
      )
      .then(() => {
        // 分享链接优先于本地存储：对方点开链接应该看到链接里的数字
        const decoded = decodeShareState(readShareToken(window.location.search));
        if (!decoded) return;
        if (!useSettingsStore.getState().setMarket(decoded.countryCode, decoded.platformId)) return;
        useInputStore.getState().setData(decoded.data);
        // 应用后清掉地址栏参数，否则用户改完数字一刷新又被链接覆盖
        window.history.replaceState({}, "", stripShareParam(window.location.href));
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <PwaRegister />
      <InstallBanner />
      {/* 侧边栏（桌面端） */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Calculator className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Margin OS</p>
            <p className="text-[10px] text-muted-foreground">跨境电商利润分析</p>
          </div>
        </div>
        <NavLinks />
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-xl lg:flex-nowrap lg:gap-x-4 lg:px-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground md:hidden">
            <Calculator className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 lg:flex-none">
            <MarketSelect />
          </div>
          <div className="order-last flex min-w-0 flex-1 basis-full items-center justify-between gap-2 lg:order-none lg:basis-auto">
            <ModeToggle />
            <RateIndicator />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 border-l border-border pl-1.5">
            <ShareButton />
            <ThemeToggle />
          </div>
        </header>

        {/* 移动端导航 */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden no-scrollbar">
          <NavLinks />
        </div>

        <main className="mx-auto w-full max-w-[1560px] flex-1 p-4 sm:p-6 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
