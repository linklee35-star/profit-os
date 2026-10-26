"use client";

import { useEffect } from "react";

/** 注册 Service Worker，启用离线缓存与可安装（PWA） */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/profit-os/sw.js").catch(() => {
        // 注册失败不影响主功能，静默忽略
      });
    }
  }, []);
  return null;
}
