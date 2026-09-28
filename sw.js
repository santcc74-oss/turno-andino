/* Turno Andino — service worker: guarda el juego en el teléfono para jugar sin internet.
   Al cambiar cualquier archivo, sube VERSION para que el teléfono descargue la versión nueva. */
const VERSION = "ta-v3";
const FILES = [
  "./", "index.html", "style.css", "manifest.webmanifest",
  "data/glossary.js", "data/modules-a.js", "data/modules-b.js", "data/modules-c.js", "data/objchecks.js", "data/extras.js", "data/distractors.js",
  "content-world.js", "content-cases.js", "content-real.js", "state.js", "progress.js", "art.js", "shift.js", "ui.js",
  "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== "ta-fonts").map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  /* Fuentes de Google: se guardan la primera vez que se usan. */
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open("ta-fonts").then((c) => c.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => { c.put(e.request, res.clone()); return res; }).catch(() => hit))));
    return;
  }
  if (url.origin !== location.origin) return;
  /* Archivos del juego: primero la copia guardada; si no existe, la red. */
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
