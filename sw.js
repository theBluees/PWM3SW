// Service Worker untuk PWA UmKla - Website Wisata Umbul Klaten
// File ini mengatur caching dan offline functionality

const CACHE_NAME = "umkla-cache-v1";

// Daftar file yang perlu di-cache untuk akses offline
const urlsToCache = [
  "./", 
  "./app.js",
  "./index.html",
  "./offline.html",
  "./umbulbesuki.html",
  "./umbulbrintik.html",
  "./umbulcokro.html",
  "./umbulmanten.html",
  "./umbulponggok.html",
  "./umbulsigedang.html",
  "./images/logoumkla.png"
];

// Event Install - Dijalankan saat SW pertama kali diinstall
self.addEventListener("install", async event => {
  // Buka cache dan tambahkan semua file yang diperlukan
  const cache = await caches.open(CACHE_NAME);
  console.log("Service Worker: Menyimpan file ke cache...");
  await cache.addAll(urlsToCache);
});

// Event Fetch - Dijalankan setiap kali browser meminta file
self.addEventListener("fetch", event => {
  event.respondWith(
    // Cek apakah file ada di cache
    caches.match(event.request)
      .then(cachedResponse => {
        // Jika ada di cache, gunakan versi cache
        // Jika tidak ada, ambil dari server
        return cachedResponse || fetch(event.request)
          .catch(() => {
            // Jika offline, tampilkan halaman offline
            if(event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            // Untuk gambar, tampilkan logo default
            if(event.request.destination === 'image') {
              return caches.match('./images/logoumkla.png');
            }
          });
      })
  );
});
