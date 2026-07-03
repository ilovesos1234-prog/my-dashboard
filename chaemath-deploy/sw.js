// 채수학교습소 서비스워커 — 앱 셸 캐시 (오프라인 지원)
const CACHE = "chaemath-v4";
const ASSETS = [
  "./app.html", "./manifest.json",
  "./logo.png", "./teacher.png",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
  "./stickers/study.png", "./stickers/focus.png", "./stickers/love.png",
  "./stickers/start.png", "./stickers/good.png", "./stickers/work.png",
  "./stickers/goal.png", "./stickers/score100.png", "./stickers/best.png",
  "./stickers/fighting.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith("index.html") || url.pathname.endsWith("app.html");
  if (isHTML) {
    // HTML은 항상 최신을 받고(업데이트 즉시 반영), 오프라인이면 캐시 사용
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 이미지/아이콘 등은 캐시 우선(빠름·오프라인)
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
