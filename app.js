// Panggil fungsi untuk mendaftarkan Service Worker
registerSW();

// Fungsi async untuk mendaftarkan Service Worker
async function registerSW() {
  // Cek apakah browser mendukung Service Worker
  if ('serviceWorker' in navigator) {
    try {
      // Daftarkan Service Worker dari file sw.js
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log('Service Worker berhasil didaftarkan!');

      // Monitor status koneksi
      window.addEventListener('online', () => {
        console.log('Aplikasi kembali online');
        window.location.href = './index.html';
      });

      window.addEventListener('offline', () => {
        console.log('Aplikasi offline');
        window.location.href = './offline.html';
      });

    } catch (error) {
      // Tampilkan pesan error jika gagal mendaftar
      console.error('Gagal mendaftarkan Service Worker:', error);
      showResult("Error saat mendaftarkan: " + error.message);
    }    
  } else {
      // Tampilkan pesan jika browser tidak mendukung Service Worker
      showResult("Browser tidak mendukung Service Worker");
  }
}; 

// Fungsi untuk menampilkan pesan hasil
function showResult(text) {
  const output = document.querySelector("output");
  if (output) {
    output.innerHTML = text;
  }
}
