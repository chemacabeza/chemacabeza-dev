// This worker caches only a public, self-contained offline message. It never
// stores page responses, API responses, credentials, or Next.js navigation data.
const CACHE_PREFIX = "chemacabeza-offline-";
// Bump this version when changing offline.html so installed apps refresh it.
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = new URL("/offline.html", self.location.origin).href;

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const response = await fetch(OFFLINE_URL, {
            cache: "reload",
            credentials: "omit",
        });

        // Do not accidentally save an authentication redirect or an error page.
        if (!response.ok || response.redirected || response.url !== OFFLINE_URL ||
            !response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("The public offline page could not be cached.");
        }

        const cache = await caches.open(CACHE_NAME);
        await cache.put(OFFLINE_URL, response);
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET" || request.mode !== "navigate" ||
        request.destination !== "document" || url.origin !== self.location.origin ||
        request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch") ||
        ["/admin", "/api", "/_next"].some((path) =>
            url.pathname === path || url.pathname.startsWith(`${path}/`))) {
        return;
    }

    // HTTP errors and normal responses are returned exactly as received. Only a
    // network failure produces the generic offline document; nothing is cached.
    event.respondWith(fetch(request).catch(async () =>
        (await caches.match(OFFLINE_URL, { cacheName: CACHE_NAME })) ?? Response.error(),
    ));
});
