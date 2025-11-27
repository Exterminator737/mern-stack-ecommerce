const VERSION = "v1";
const APP_SHELL_CACHE = `app-shell-${VERSION}`;
const API_CACHE = `api-products-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
const IMG_CACHE = `images-${VERSION}`;

const APP_SHELL = ["/", "/index.html"];

addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  skipWaiting();
});

addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                ![APP_SHELL_CACHE, API_CACHE, STATIC_CACHE, IMG_CACHE].includes(
                  k
                )
            )
            .map((k) => caches.delete(k))
        )
      )
  );
  clients.claim();
});

function isProductsApi(request) {
  try {
    const url = new URL(request.url);
    return (
      url.origin === location.origin && url.pathname.startsWith("/api/products")
    );
  } catch (_) {
    return false;
  }
}

addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(APP_SHELL_CACHE);
        const cached = await cache.match("/index.html");
        return cached || Response.error();
      })
    );
    return;
  }

  if (isProductsApi(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        try {
          const networkResp = await fetch(request);
          if (networkResp && networkResp.status === 200) {
            cache.put(request, networkResp.clone());
          }
          return networkResp;
        } catch (_) {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ products: [], totalPages: 1, total: 0 }),
            {
              headers: { "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      })()
    );
    return;
  }

  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((networkResp) => {
              if (networkResp && networkResp.status === 200) {
                cache.put(request, networkResp.clone());
              }
              return networkResp;
            })
            .catch(() => cached || Response.error());
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((networkResp) => {
              if (networkResp && networkResp.status === 200) {
                cache.put(request, networkResp.clone());
              }
              return networkResp;
            })
            .catch(() => cached || Response.error());
          return cached || fetchPromise;
        })
      )
    );
    return;
  }
});
