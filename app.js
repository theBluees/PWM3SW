// Memanggil fungsi untuk mendaftarkan Service Worker
registerSW();

// Fungsi asinkron untuk mendaftarkan Service Worker
async function registerSW() {
  // Memeriksa apakah browser mendukung Service Worker
  if ("serviceWorker" in navigator) {
    try {
      // Mendaftarkan Service Worker dari file sw.js
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker berhasil didaftarkan!");

      // Memantau status koneksi internet
      window.addEventListener("online", () => {
        console.log("Aplikasi kembali online");
        window.location.href = "./index.html";
      });

      window.addEventListener("offline", () => {
        console.log("Aplikasi offline");
        window.location.href = "./offline.html";
      });
    } catch (error) {
      // Menampilkan pesan kesalahan jika pendaftaran gagal
      console.error("Gagal mendaftarkan Service Worker:", error);
      showResult("Terjadi kesalahan saat mendaftarkan: " + error.message);
    }
  } else {
    // Menampilkan pesan jika browser tidak mendukung Service Worker
    showResult("Browser tidak mendukung Service Worker");
  }
}

// Fungsi untuk menampilkan pesan hasil pada elemen output
function showResult(text) {
  const output = document.querySelector("output");
  if (output) {
    output.innerHTML = text;
  }
}

// Membuka atau membuat database IndexedDB
let db;
const request = indexedDB.open("umbulKlatenDB", 1);

// Menangani kesalahan saat membuka database
request.onerror = function (event) {
  console.error("Terjadi kesalahan pada database:", event.target.errorCode);
};

// Menangani keberhasilan saat membuka database
request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Database berhasil dibuka.");
  tampilkanReview(); // Memanggil fungsi untuk menampilkan review
};

// Membuat object store dan index jika database baru atau versi berubah
request.onupgradeneeded = function (event) {
  db = event.target.result;
  const store = db.createObjectStore("kontak", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("name", "name", { unique: false });
  store.createIndex("email", "email", { unique: false });
  store.createIndex("message", "message", { unique: false });
};

// Fungsi untuk menyimpan data kritik/saran ke IndexedDB
function simpanKontak(name, email, message) {
  const rating = parseInt(document.getElementById("rating").value) || 5;
  const tx = db.transaction(["kontak"], "readwrite");
  const store = tx.objectStore("kontak");
  const data = { name, email, message, rating, created: Date.now() };
  const req = store.add(data);

  req.onsuccess = () => {
    tampilkanReview();
    alert("Terima kasih! Kritik dan saran Anda telah disimpan.");
    // Mengosongkan form setelah submit
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
    document.getElementById("rating").value = "5";
  };

  req.onerror = () => {
    alert("Gagal menyimpan pesan.");
  };
}

// Fungsi untuk menampilkan review terbaru pada halaman
function tampilkanReview() {
  const tx = db.transaction(["kontak"], "readonly");
  const store = tx.objectStore("kontak");
  const request = store.getAll();

  request.onsuccess = function (event) {
    let reviews = event.target.result;
    // Mengurutkan review dari yang terbaru
    reviews.sort((a, b) => b.created - a.created);
    // Mengambil 5 review terbaru
    reviews = reviews.slice(0, 5);

    const container = document.getElementById("list-review");
    container.innerHTML = "";

    reviews.forEach((item) => {
      // Mengambil huruf depan nama untuk avatar
      const initial = item.name ? item.name.charAt(0).toUpperCase() : "?";
      // Membuat tampilan bintang rating
      const stars =
        "★".repeat(item.rating || 5) + "☆".repeat(5 - (item.rating || 5));
      // Memformat tanggal agar mudah dibaca
      const tanggal = item.created
        ? new Date(item.created).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";

      // Menampilkan review ke dalam HTML
      const div = document.createElement("div");
      div.className =
        "flex items-start space-x-4 bg-white p-4 rounded-lg shadow border border-green-100";
      div.innerHTML = `
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl shadow">
            ${initial}
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center mb-1">
            <strong class="text-green-700 mr-2">${item.name}</strong>
            <span class="text-yellow-400 text-base">${stars}</span>
          </div>
          <p class="text-gray-700 mb-2">${item.message}</p>
          <div class="text-xs text-gray-400">${tanggal}</div>
        </div>
      `;
      container.appendChild(div);
    });
  };
}

// Koordinat Klaten
const lat = -7.7;
const lon = 110.6;

// Mengambil data cuaca dari Open-Meteo
fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
)
  .then((res) => res.json())
  .then((data) => {
    // Mengambil data cuaca terkini
    const cw = data.current_weather;
    const suhu = cw.temperature;
    const angin = cw.windspeed;
    const kodeCuaca = cw.weathercode;

    // Mengubah kode cuaca menjadi deskripsi yang mudah dipahami
    const deskripsiCuaca = getDeskripsiCuaca(kodeCuaca);

    // Menampilkan informasi cuaca pada elemen dengan id "cuaca-klaten"
    document.getElementById("cuaca-klaten").innerHTML = `
  <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2 bg-white bg-opacity-80 rounded-lg shadow px-4 py-2">
    <span class="font-semibold text-gray-800">Cuaca Klaten:</span>
    <span class="text-gray-800">${deskripsiCuaca},</span>
    <span class="text-gray-800">🌡️ ${suhu}°C,</span>
    <span class="text-gray-800">🌬️ ${angin} m/s</span>
  </div>
`;
  })
  .catch((error) => {
    document.getElementById("cuaca-klaten").innerHTML =
      "Gagal mengambil data cuaca.";
    console.error("Gagal mengambil data cuaca:", error);
  });

// Fungsi untuk mengonversi kode cuaca ke deskripsi (berdasarkan kode dari Open-Meteo)
function getDeskripsiCuaca(kode) {
  const kondisi = {
    0: "Cerah",
    1: "Cerah Berawan",
    2: "Berawan",
    3: "Berawan Tebal",
    45: "Berkabut",
    48: "Kabut Beku",
    51: "Gerimis Ringan",
    53: "Gerimis Sedang",
    55: "Gerimis Lebat",
    61: "Hujan Ringan",
    63: "Hujan Sedang",
    65: "Hujan Lebat",
    80: "Hujan Lokal",
    81: "Hujan Luas",
    82: "Hujan Deras Luas",
  };
  return kondisi[kode] || "Cuaca tidak diketahui";
}

// Inisialisasi peta Leaflet untuk menampilkan lokasi umbul di Klaten
document.addEventListener("DOMContentLoaded", function () {
  // Membuat peta dengan posisi tengah di Klaten
  const map = L.map("map").setView([-7.7044, 110.6071], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Daftar lokasi umbul di Klaten
  const umbulList = [
    { nama: "Umbul Ponggok", lat: -7.6231, lon: 110.6781 },
    { nama: "Umbul Manten", lat: -7.6278, lon: 110.6462 },
    { nama: "Umbul Sigedang", lat: -7.6402, lon: 110.6287 },
    { nama: "Umbul Cokro", lat: -7.6481, lon: 110.6424 },
    { nama: "Umbul Brintik", lat: -7.6512, lon: 110.6145 },
    { nama: "Umbul Besuki", lat: -7.6567, lon: 110.632 },
  ];

  // Menambahkan marker untuk setiap umbul pada peta
  umbulList.forEach((u) => {
    L.marker([u.lat, u.lon])
      .addTo(map)
      .bindPopup(
        `<strong>${u.nama}</strong><br>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${u.lat},${u.lon}" target="_blank" rel="noopener" class="text-green-700 underline">
          Lihat Rute di Google Maps
        </a>`
      );
  });

  // Memastikan fungsi tampilkanReview dipanggil saat halaman dimuat
  if (typeof tampilkanReview === "function") {
    tampilkanReview();
  }
});
