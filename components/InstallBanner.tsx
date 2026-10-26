"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** PWA 安装提示条：首次可安装时显示，点击按钮触发浏览器安装对话框 */
export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // 如果已安装（display-mode: standalone），不显示
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setDeferred(null);
    }
    setDismissed(true);
  };

  if (!deferred || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-slide-up rounded-xl border border-primary/30 bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Download className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">安装为桌面应用</p>
            <p className="text-[11px] text-muted-foreground">
              添加到桌面，下次秒开
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={install}
          >
            安装
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setDismissed(true)}
          >
            暂不
          </Button>
        </div>
      </div>
    </div>
  );
}
