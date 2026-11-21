// OTAK INGATAN MAVIX V2.1 - LEMARI + OTOMATIS + GABUNG
// Tugasnya: SIMPAN, CARI, HAPUS, INGAT OTOMATIS, BUAT CATATAN UNTUK OTAK BESAR
// Tidak boleh mikir, cuma simpan dan kasih catatan.

let ingatanMAVIX = [];

try {
  let lama = localStorage.getItem("mavix_ingatan_v2");
  if (lama) ingatanMAVIX = JSON.parse(lama);
} catch(e) { ingatanMAVIX = []; }

function simpanIngatan() {
  try { localStorage.setItem("mavix_ingatan_v2", JSON.stringify(ingatanMAVIX)); } catch(e) {}
}

// SIMPAN - dipakai Otak Kecil / Otak Depan
function ingat(apa, kategori, siapa) {
  if (!apa) return "";
  // Kalau sudah ada yang sama, jangan simpan dobel, update saja
  let ada = ingatanMAVIX.find(m => m.apa.toLowerCase() === apa.toLowerCase() && m.kategori === kategori);
  if (ada) {
    ada.bila = new Date().toLocaleString("id-ID");
    simpanIngatan();
    return "Sudah saya update Bos: " + apa;
  }
  ingatanMAVIX.push({
    apa: apa,
    kategori: kategori || "umum", // nama, suka, tidak_suka, perasaan, catatan, janji
    siapa: siapa || "Bos",
    bila: new Date().toLocaleString("id-ID")
  });
  if (ingatanMAVIX.length > 200) ingatanMAVIX = ingatanMAVIX.slice(-200);
  simpanIngatan();
  return "Siap Bos, saya sudah ingat: " + apa;
}

// CARI - dipakai Otak Kecil / Otak Depan
function cariIngatan(kataKunci, kategori) {
  let k = kataKunci.toLowerCase();
  return ingatanMAVIX.filter(m => {
    let cocokKata = m.apa.toLowerCase().includes(k);
    let cocokKategori = !kategori || m.kategori === kategori;
    return cocokKata && cocokKategori;
  });
}

function ambilIngatan(kategori) {
  let hasil = ingatanMAVIX.filter(m => m.kategori === kategori);
  if (hasil.length === 0) return "";
  return hasil[hasil.length - 1].apa; // ambil yang paling baru
}

function apaYangSayaIngat() {
  if (ingatanMAVIX.length === 0) return "Saya belum ingat apa-apa lagi Bos.";
  return ingatanMAVIX.map((m, i) => (i+1) + ". [" + m.kategori + "] " + m.apa + " - " + m.bila).join("\n");
}

function lupaSemua() {
  ingatanMAVIX = [];
  simpanIngatan();
  return "Siap Bos, saya sudah lupa semua.";
}

function lupaKategori(kategori) {
  ingatanMAVIX = ingatanMAVIX.filter(m => m.kategori !== kategori);
  simpanIngatan();
  return "Siap Bos, ingatan soal " + kategori + " sudah saya hapus.";
}

// ===== BARU - TAMBAHAN V2.1 - INI YANG KURANG TADI =====

// 1. INGAT OTOMATIS - Biar Bos tidak perlu suruh suruh
// Dipanggil otomatis sama otak-depan.js setiap Bos ketik
// Contoh: Bos ketik "nama saya Budi" -> langsung simpan kategori "nama"
// Contoh: Bos ketik "saya suka kopi" -> langsung simpan kategori "suka"
function ingatOtomatis(teks) {
  if (!teks) return "";
  let t = teks.toLowerCase().trim();
  let hasil = "";

  // Nama Bos
  if (t.includes("nama saya") || t.includes("nama ku") || t.includes("namaku") || t.includes("panggil saya") || t.includes("panggil aku")) {
    hasil = ingat(teks, "nama", "Bos");
    return hasil;
  }
  // Suka
  if (t.includes("saya suka") || t.includes("aku suka") || t.includes("suka kopi") || t.includes("suka makan")) {
    hasil = ingat(teks, "suka", "Bos");
    return hasil;
  }
  // Tidak suka
  if (t.includes("tidak suka") || t.includes("tak suka") || t.includes("tidak suka pedas") || t.includes("benci")) {
    hasil = ingat(teks, "tidak_suka", "Bos");
    return hasil;
  }
  // Kerja / tinggal
  if (t.includes("saya kerja") || t.includes("aku kerja") || t.includes("tinggal di") || t.includes("saya di johor") || t.includes("saya dari")) {
    hasil = ingat(teks, "tentang_bos", "Bos");
    return hasil;
  }
  // Perasaan
  if (t.includes("saya sedih") || t.includes("aku sedih") || t.includes("saya senang") || t.includes("saya stress") || t.includes("saya capek")) {
    hasil = ingat(teks, "perasaan", "Bos");
    return hasil;
  }
  // Janji / ingatkan
  if (t.includes("ingatkan") || t.includes("ingat ya") || t.includes("jangan lupa") || t.includes("besok")) {
    hasil = ingat(teks, "janji", "Bos");
    return hasil;
  }
  // Kalau tidak ada yang cocok, simpan sebagai catatan umum saja kalau kalimatnya panjang dan penting
  // Tapi jangan simpan semua chat, nanti lemari penuh sampah
  return "";
}

// 2. BUAT CATATAN UNTUK OTAK BESAR - Ini GABUNG nya Bos
// Hasilnya contoh: "CATATAN TENTANG BOS: [nama] nama saya Budi - [suka] saya suka kopi"
// Ini yang dikirim ke Groq, biar Groq bisa jawab pakai ingatan
function buatCatatanUntukOtakBesar() {
  if (ingatanMAVIX.length === 0) return "";
  // Ambil 15 yang paling baru saja, biar tidak kepanjangan
  let terbaru = ingatanMAVIX.slice(-15);
  let catatan = terbaru.map(m => "[" + m.kategori + "] " + m.apa).join(" | ");
  return "CATATAN TENTANG BOS YANG HARUS KAMU INGAT: " + catatan + ". ";
}

// Biar otak-depan.js dan server.js bisa pakai
window.ingat = ingat;
window.cariIngatan = cariIngatan;
window.ambilIngatan = ambilIngatan;
window.apaYangSayaIngat = apaYangSayaIngat;
window.lupaSemua = lupaSemua;
window.lupaKategori = lupaKategori;
window.ingatanMAVIX = ingatanMAVIX;
window.ingatOtomatis = ingatOtomatis;
window.buatCatatanUntukOtakBesar = buatCatatanUntukOtakBesar;

console.log("otak-ingatan V2.1 hidup! Lemari + Otomatis + Gabung siap Bos.");
