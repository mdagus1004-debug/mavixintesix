// ==========================================
// File: otak-ingatan.js - VERSI V3
// Perbaikan: 6 Laci Bocor + Hobi + Makanan/Minuman + Lupakan/Hapus + Cara Mendengar
// ==========================================

// 1. LEMARI DI OTAK
let lemariBos = {};
let arsipObrolan = [];
let mejaKecil = [];

// Daftar baru V3: yang jadi daftar, bukan 1 buah
let daftarCatatan = []; // Bisa pegang 10 catatan
let daftarTugas = []; // Cadangan, biar tidak campur
let riwayatPerasaan = []; // Perasaan + tanggal

// 2. BACA DARI HP SAAT MAVIX DIBUKA
try {
  const daftarKunci = ["nama", "suka", "perasaan", "kota", "pekerjaan", "catatan", "hobi", "makanan", "minuman"];
  daftarKunci.forEach(kunci => {
    const nilai = localStorage.getItem("lemariBos_" + kunci);
    if (nilai) lemariBos[kunci] = nilai;
  });
  // Baca daftar catatan V3
  const simpananDaftar = localStorage.getItem("lemariBos_daftarCatatan");
  if (simpananDaftar) daftarCatatan = JSON.parse(simpananDaftar);
  const simpananPerasaan = localStorage.getItem("lemariBos_riwayatPerasaan");
  if (simpananPerasaan) riwayatPerasaan = JSON.parse(simpananPerasaan);

  const simpananArsip = localStorage.getItem("arsipObrolanBos");
  if (simpananArsip) arsipObrolan = JSON.parse(simpananArsip);
} catch (galat) {}

// 3. TANGAN YANG MENULIS
function catat(nilai, kunci) {
  lemariBos[kunci] = nilai;
  try { localStorage.setItem("lemariBos_" + kunci, nilai); } catch (galat) {}
  return true;
}

// 4. TANGAN YANG MEMBACA
function ambilCatatan(kunci) {
  // Kalau minta daftar catatan, kembalikan daftar, bukan 1 buah
  if (kunci === "daftarCatatan") return daftarCatatan;
  if (kunci === "riwayatPerasaan") return riwayatPerasaan;
  return lemariBos[kunci] || null;
}

// Fungsi baru V3: Simpan ke daftar
function simpanKeDaftar(nilai, namaDaftar) {
  if (!nilai) return false;
  if (namaDaftar === "daftarCatatan") {
    daftarCatatan.push({ isi: nilai, jam: new Date().toLocaleString() });
    if (daftarCatatan.length > 10) daftarCatatan.shift(); // Buang yang paling lama kalau sudah 10
    try { localStorage.setItem("lemariBos_daftarCatatan", JSON.stringify(daftarCatatan)); } catch (galat) {}
    // Tetap simpan juga di laci lama biar file lama tidak error
    catat(nilai, "catatan");
  }
  return true;
}

// Fungsi baru V3: Lupakan / Hapus
function lupakan(kunci) {
  // Kalau Bos bilang "lupakan semua", hapus semua
  if (kunci === "semua") {
    lemariBos = {};
    daftarCatatan = [];
    riwayatPerasaan = [];
    try {
      const semuaKunci = ["nama", "suka", "perasaan", "kota", "pekerjaan", "catatan", "hobi", "makanan", "minuman", "daftarCatatan", "riwayatPerasaan"];
      semuaKunci.forEach(k => localStorage.removeItem("lemariBos_" + k));
    } catch (galat) {}
    return "Semua ingatan sudah saya lupakan, Bos.";
  }

  // Kalau Bos bilang "lupakan catatan", hapus daftar catatan saja
  if (kunci === "catatan" || kunci === "daftarCatatan") {
    daftarCatatan = [];
    try { localStorage.removeItem("lemariBos_daftarCatatan"); } catch (galat) {}
    catat("", "catatan");
    return "Catatan sudah saya hapus, Bos.";
  }

  // Kalau Bos bilang "lupakan nama", hapus 1 laci saja
  if (lemariBos[kunci]) {
    delete lemariBos[kunci];
    try { localStorage.removeItem("lemariBos_" + kunci); } catch (galat) {}
    return "Sudah saya lupakan " + kunci + ", Bos.";
  }
  return "Tidak ada " + kunci + " yang perlu dilupakan, Bos.";
}

// 5. SIMPAN OBROLAN
function simpanObrolan(siapa, isi) {
  const data = { siapa: siapa, isi: isi, jam: new Date().toLocaleTimeString() };
  arsipObrolan.push(data);
  if (arsipObrolan.length > 100) arsipObrolan.shift();
  try { localStorage.setItem("arsipObrolanBos", JSON.stringify(arsipObrolan)); } catch (galat) {}

  const isiKecil = isi.toLowerCase();
  if (isiKecil.includes("nama saya") || isiKecil.includes("saya suka") || isiKecil.includes("tolong ingat") || isiKecil.includes("hobi")) {
    mejaKecil.push(data);
    if (mejaKecil.length > 4) mejaKecil.shift();
  }
}
function ambilObrolan() { return mejaKecil; }

// ==========================================
// 6. TUKANG DENGAR V3 - SUDAH DIPERBAIKI SEMUA
// ==========================================

// Fungsi bantu V3: Bersihkan kata pengotor
function bersihkanTeks(teks) {
  if (!teks) return "";
  let hasil = teks.trim();
  // Buang kata pengotor di belakang: banget, sangat, sekali, dong, ya, lho, deh
  hasil = hasil.replace(/\s+(banget|sangat|sekali|dong|ya|lho|deh|nih|kok)\s*$/i, "");
  // Buang kata pengotor di depan pekerjaan: sebagai, jadi, adalah, yaitu
  hasil = hasil.replace(/^(sebagai|jadi|adalah|yaitu|sebagai seorang)\s+/i, "");
  return hasil.trim();
}

function catatOtomatis(teks) {
  if (!teks) return false;
  const teksKecil = teks.toLowerCase();
  let adaYangTercatat = false;

  // --- PERINTAH LUPAKAN / HAPUS - V3 BARU ---
  // Harus dicek PALING AWAL, sebelum catat yang lain
  // Contoh: "lupakan nama saya", "hapus catatan", "lupakan semua"
  if (teksKecil.includes("lupakan") || teksKecil.includes("hapus ingatan") || teksKecil.includes("lupa kan")) {
    if (teksKecil.includes("semua") || teksKecil.includes("semuanya")) {
      lupakan("semua"); adaYangTercatat = true; return true;
    }
    if (teksKecil.includes("catatan")) { lupakan("catatan"); adaYangTercatat = true; }
    if (teksKecil.includes("nama")) { lupakan("nama"); adaYangTercatat = true; }
    if (teksKecil.includes("suka")) { lupakan("suka"); adaYangTercatat = true; }
    if (teksKecil.includes("hobi")) { lupakan("hobi"); adaYangTercatat = true; }
    if (teksKecil.includes("makanan")) { lupakan("makanan"); adaYangTercatat = true; }
    if (teksKecil.includes("minuman")) { lupakan("minuman"); adaYangTercatat = true; }
    if (teksKecil.includes("kota")) { lupakan("kota"); adaYangTercatat = true; }
    if (teksKecil.includes("pekerjaan")) { lupakan("pekerjaan"); adaYangTercatat = true; }
    if (teksKecil.includes("perasaan")) { lupakan("perasaan"); adaYangTercatat = true; }
    // Kalau sudah lupakan, jangan lanjut catat lagi
    return adaYangTercatat;
  }
  if (teksKecil.includes("hapus catatan")) { lupakan("catatan"); return true; }

  // --- NAMA - PERBAIKAN BOCOR No.1: Sekarang 4 kata, kenal banyak gaya ---
  // Dulu cuma kenal "nama saya", sekarang kenal 5 gaya
  if (teksKecil.includes("nama saya") || teksKecil.includes("namaku") || teksKecil.includes("panggil saya") || teksKecil.includes("panggil aku") || teksKecil.includes("nama gue")) {
    let sisa = "";
    if (teksKecil.includes("nama saya")) sisa = teks.split(/nama saya/i)[1] || "";
    else if (teksKecil.includes("namaku")) sisa = teks.split(/namaku/i)[1] || "";
    else if (teksKecil.includes("panggil saya")) sisa = teks.split(/panggil saya/i)[1] || "";
    else if (teksKecil.includes("panggil aku")) sisa = teks.split(/panggil aku/i)[1] || "";
    else if (teksKecil.includes("nama gue")) sisa = teks.split(/nama gue/i)[1] || "";

    sisa = sisa.split(",")[0].split(/ dan /i)[0].split(/ saya /i)[0].trim();
    // Sekarang 4 kata, bukan 3 lagi. "Muhammad Ali Ahmad Bin" bisa masuk
    let kataKata = sisa.split(/\s+/).filter(k => k.length > 0);
    let nama = kataKata.slice(0, 4).join(" ");
    nama = bersihkanTeks(nama.replace(/[^a-zA-Z ]/g, ""));
    if (nama) { catat(nama, "nama"); adaYangTercatat = true; }
  }

  // --- HOBI - BARU V3 ---
  // Contoh: "hobi saya main bola", "hobiku main bola", "hobi gue main bola"
  if (teksKecil.includes("hobi saya") || teksKecil.includes("hobiku") || teksKecil.includes("hobi gue")) {
    let sisaHobi = "";
    if (teksKecil.includes("hobi saya")) sisaHobi = teks.split(/hobi saya/i)[1] || "";
    else if (teksKecil.includes("hobiku")) sisaHobi = teks.split(/hobiku/i)[1] || "";
    else if (teksKecil.includes("hobi gue")) sisaHobi = teks.split(/hobi gue/i)[1] || "";
    sisaHobi = sisaHobi.split(",")[0].split(/ saya /i)[0].trim();
    sisaHobi = bersihkanTeks(sisaHobi);
    if (sisaHobi) { catat(sisaHobi, "hobi"); adaYangTercatat = true; }
  }

  // --- MAKANAN - BARU V3 ---
  // Contoh: "makanan kesukaan saya nasi lemak", "saya suka makan nasi lemak"
  if (teksKecil.includes("makanan kesukaan saya") || teksKecil.includes("makanan favorit saya") || teksKecil.includes("saya suka makan")) {
    let sisaMakan = "";
    if (teksKecil.includes("makanan kesukaan saya")) sisaMakan = teks.split(/makanan kesukaan saya/i)[1] || "";
    else if (teksKecil.includes("makanan favorit saya")) sisaMakan = teks.split(/makanan favorit saya/i)[1] || "";
    else if (teksKecil.includes("saya suka makan")) sisaMakan = teks.split(/saya suka makan/i)[1] || "";
    sisaMakan = sisaMakan.split(",")[0].split(/ saya /i)[0].trim();
    sisaMakan = bersihkanTeks(sisaMakan);
    if (sisaMakan) { catat(sisaMakan, "makanan"); adaYangTercatat = true; }
  }

  // --- MINUMAN - BARU V3 ---
  // Contoh: "minuman kesukaan saya teh ais", "saya suka minum teh ais"
  if (teksKecil.includes("minuman kesukaan saya") || teksKecil.includes("minuman favorit saya") || teksKecil.includes("saya suka minum")) {
    let sisaMinum = "";
    if (teksKecil.includes("minuman kesukaan saya")) sisaMinum = teks.split(/minuman kesukaan saya/i)[1] || "";
    else if (teksKecil.includes("minuman favorit saya")) sisaMinum = teks.split(/minuman favorit saya/i)[1] || "";
    else if (teksKecil.includes("saya suka minum")) sisaMinum = teks.split(/saya suka minum/i)[1] || "";
    sisaMinum = sisaMinum.split(",")[0].split(/ saya /i)[0].trim();
    sisaMinum = bersihkanTeks(sisaMinum);
    if (sisaMinum) { catat(sisaMinum, "minuman"); adaYangTercatat = true; }
  }

  // --- SUKA - PERBAIKAN BOCOR No.2: Dibersihkan, tidak campur dengan makanan/hobi lagi ---
  if (teksKecil.includes("saya suka") && !teksKecil.includes("saya suka makan") && !teksKecil.includes("saya suka minum")) {
    let sisaSuka = teks.split(/saya suka/i)[1] || "";
    sisaSuka = sisaSuka.split(",")[0].trim();
    sisaSuka = bersihkanTeks(sisaSuka);
    if (sisaSuka) { catat(sisaSuka, "suka"); adaYangTercatat = true; }
  }

  // --- KOTA - PERBAIKAN BOCOR No.3: Sekarang sampai koma, bukan 2 kata ---
  if (teksKecil.includes("saya tinggal di") || teksKecil.includes("saya di") || teksKecil.includes("tinggal di")) {
    let kota = "";
    if (teksKecil.includes("saya tinggal di")) kota = teks.split(/saya tinggal di/i)[1] || "";
    else if (teksKecil.includes("saya di")) kota = teks.split(/saya di/i)[1] || "";
    else if (teksKecil.includes("tinggal di")) kota = teks.split(/tinggal di/i)[1] || "";
    kota = kota.split(",")[0].split(/ saya /i)[0].trim();
    kota = bersihkanTeks(kota);
    // Tidak dipotong 2 kata lagi, biar "Kuala Lumpur" dan "Johor Bahru" utuh
    if (kota) { catat(kota, "kota"); adaYangTercatat = true; }
  }

  // --- PEKERJAAN - PERBAIKAN BOCOR No.4: Bersihkan kata "sebagai", "jadi" ---
  if (teksKecil.includes("kerja saya") || teksKecil.includes("saya kerja") || teksKecil.includes("kerja gue")) {
    let pekerjaan = "";
    if (teksKecil.includes("saya kerja")) pekerjaan = teks.split(/saya kerja/i)[1] || "";
    else if (teksKecil.includes("kerja saya")) pekerjaan = teks.split(/kerja saya/i)[1] || "";
    else if (teksKecil.includes("kerja gue")) pekerjaan = teks.split(/kerja gue/i)[1] || "";
    pekerjaan = pekerjaan.split(",")[0].split(/ saya /i)[0].trim();
    pekerjaan = bersihkanTeks(pekerjaan); // Buang "sebagai", "jadi", "banget"
    if (pekerjaan) { catat(pekerjaan, "pekerjaan"); adaYangTercatat = true; }
  }

  // --- PERASAAN - PERBAIKAN BOCOR No.5: Sekarang ada tanggal, ada riwayat ---
  const daftarPerasaan = ["sedih", "senang", "capek", "lapar", "marah", "ngantuk", "kesal", "bahagia", "bosan", "stress", "galau"];
  daftarPerasaan.forEach(perasaan => {
    if (teksKecil.includes("saya " + perasaan) || teksKecil.includes("aku " + perasaan) || teksKecil.includes("gue " + perasaan)) {
      catat(perasaan, "perasaan");
      // Simpan juga ke riwayat + tanggal, biar tidak hilang
      riwayatPerasaan.push({ perasaan: perasaan, tanggal: new Date().toLocaleDateString(), jam: new Date().toLocaleTimeString() });
      if (riwayatPerasaan.length > 30) riwayatPerasaan.shift(); // Simpan 30 perasaan terakhir
      try { localStorage.setItem("lemariBos_riwayatPerasaan", JSON.stringify(riwayatPerasaan)); } catch (galat) {}
      adaYangTercatat = true;
    }
  });

  // --- CATATAN - PERBAIKAN BOCOR No.6: Sekarang jadi daftar 10, bukan 1 ---
  if (teksKecil.includes("tolong ingat") || teksKecil.includes("ingat ya") || teksKecil.includes("catat ya")) {
    let isi = "";
    if (teksKecil.includes("tolong ingat")) isi = teks.split(/tolong ingat/i)[1] || "";
    else if (teksKecil.includes("ingat ya")) isi = teks.split(/ingat ya/i)[1] || "";
    else if (teksKecil.includes("catat ya")) isi = teks.split(/catat ya/i)[1] || "";
    isi = isi.trim();
    isi = bersihkanTeks(isi);
    if (isi) { simpanKeDaftar(isi, "daftarCatatan"); adaYangTercatat = true; }
  }

  return adaYangTercatat;
}

// ==========================================
// 7. DAFTARKAN
// ==========================================
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.simpanObrolan = simpanObrolan;
window.ambilObrolan = ambilObrolan;
window.catatOtomatis = catatOtomatis;
window.lupakan = lupakan;
window.simpanKeDaftar = simpanKeDaftar;

window.ingat = catat;
window.ingatOtomatis = catatOtomatis;
window.ambilIngatan = ambilCatatan;
window.simpanChat = simpanObrolan;
window.hapusIngatan = lupakan;
