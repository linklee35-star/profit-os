"use client";

import * as React from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInputStore } from "@/store/useInputStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { buildShareUrl, encodeShareState, stripShareParam } from "@/lib/share";

/**
 * 复制分享链接：把当前输入编码进 URL，对方打开即看到同一份测算。
 * 数据不出浏览器，也不需要后端。
 */
export function ShareButton() {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleClick = async () => {
    const { data } = useInputStore.getState();
    const { countryCode, platformId } = useSettingsStore.getState();
    const token = encodeShareState(data, countryCode, platformId);
    const url = buildShareUrl(stripShareParam(window.location.href), token);

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 非 HTTPS 或用户拒绝剪贴板权限时，退化为手动复制
      window.prompt("复制这个链接分享给同事：", url);
      return;
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      aria-label="复制分享链接"
      title={copied ? "链接已复制" : "复制分享链接"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
    </Button>
  );
}
