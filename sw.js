// Service Worker untuk PWA UmKla - Website Wisata Umbul Klaten
// File ini mengatur caching dan offline functionality

const CACHE_NAME = "umkla-cache-v1";

// Daftar file yang perlu di-cache untuk akses offline
const urlsToCache = [
  "./",
  "./app.js",
  "./index.html",
  "./umbulbesuki.html",
  "./umbulbrintik.html",
  "./umbulcokro.html",
  "./umbulmanten.html",
  "./umbulponggok.html",
  "./umbulsigedang.html",
  "./images/logoumkla.png",
];

// Event Install - Dijalankan saat SW pertama kali diinstall
self.addEventListener("install", async (event) => {
  // Buka cache dan tambahkan semua file yang diperlukan
  const cache = await caches.open(CACHE_NAME);
  console.log("Service Worker: Menyimpan file ke cache...");
  await cache.addAll(urlsToCache);
});

// Event Fetch - Dijalankan setiap kali browser meminta file
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Jika tidak ada koneksi internet
          if (self.registration && self.registration.showNotification) {
            self.registration.showNotification("Tidak ada koneksi internet", {
              body: "Anda sedang offline. Silakan periksa koneksi Anda.",
              icon: "./images/logoumkla.png",
            });
          }
          // Untuk permintaan navigasi, tampilkan pesan HTML sederhana
          if (event.request.mode === "navigate") {
            return new Response(
              `<html><head><title>Offline</title></head>
              <body style="font-family:sans-serif;text-align:center;padding:2rem;">
              <img src="images/logoumkla.png" alt="Logo" style="width:80px;margin-bottom:16px;">
              <h2>Anda sedang offline</h2>
              <p>Silakan periksa koneksi internet Anda dan coba lagi.</p>
              </body></html>`,
              { headers: { "Content-Type": "text/html" } }
            );
          }
          // Untuk gambar, tampilkan logo default
          if (event.request.destination === "image") {
            return caches.match("./images/logoumkla.png");
          }
        })
      );
    })
  );
});
