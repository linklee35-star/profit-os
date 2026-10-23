// Profit OS Service Worker —— 离线缓存 + 可安装
// 导航请求：网络优先（始终拿到最新 HTML，避免旧页面问题），失败回退缓存
// 静态资源：缓存优先（更快加载）
// 部署于 GitHub Pages 子路径 /profit-os，所有预缓存 URL 需带前缀
const CACHE = "profit-os-v2";
const BASE = "/profit-os";
const APP_SHELL = [`${BASE}/`, `${BASE}/sku-library`, `${BASE}/batch-test`, `${BASE}/settings`, `${BASE}/manifest.webmanifest`];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL).catch(() => {})),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 不缓存跨域（汇率 API 等）

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(`${BASE}/`))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => cached),
    ),
  );
});
