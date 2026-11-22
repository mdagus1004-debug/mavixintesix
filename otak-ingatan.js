// ==========================================
// File: otak-ingatan.js - VERSI BAHASA INDONESIA
// Rumahnya Lemari. Satu-satunya tukang catat.
// ==========================================

// 1. LEMARI DI OTAK (Memori Cepat)
let lemariBos = {};
let arsipObrolan = []; // Arsip Besar 100 obrolan
let mejaKecil = []; // Meja Kecil 4 obrolan penting

// 2. BACA DARI HP SAAT MAVIX DIBUKA
try {
  const daftarKunci = ["nama", "suka", "perasaan", "kota", "pekerjaan", "catatan"];
  daftarKunci.forEach(kunci => {
    const nilai = localStorage.getItem("lemariBos_" + kunci);
    if (nilai) lemariBos[kunci] = nilai;
  });
  const simpananArsip = localStorage.getItem("arsipObrolanBos");
  if (simpananArsip) arsipObrolan = JSON.parse(simpananArsip);
} catch (galat) {}

// 3. TANGAN YANG MENULIS - SATU-SATUNYA
function catat(nilai, kunci) {
  lemariBos[kunci] = nilai;
  try { localStorage.setItem("lemariBos_" + kunci, nilai); } catch (galat) {}
  return true;
}

// 4. TANGAN YANG MEMBACA
function ambilCatatan(kunci) {
  return lemariBos[kunci] || null;
}

// 5. SIMPAN OBROLAN - Arsip + Meja Kecil
function simpanObrolan(siapa, isi) {
  const data = { siapa: siapa, isi: isi, jam: new Date().toLocaleTimeString() };
  arsipObrolan.push(data);
  if (arsipObrolan.length > 100) arsipObrolan.shift();
  try { localStorage.setItem("arsipObrolanBos", JSON.stringify(arsipObrolan)); } catch (galat) {}

  // Meja Kecil cuma simpan yang penting saja
  const isiKecil = isi.toLowerCase();
  if (isiKecil.includes("nama saya") || isiKecil.includes("saya suka") || isiKecil.includes("tolong ingat")) {
    mejaKecil.push(data);
    if (mejaKecil.length > 4) mejaKecil.shift();
  }
}

function ambilObrolan() { return mejaKecil; }

// ==========================================
// 6. TUKANG DENGAR - SATU-SATUNYA YANG CATAT
// Ini yang dipanggil Otak Depan paling awal.
// ==========================================
function catatOtomatis(teks) {
  if (!teks) return;
  const teksKecil = teks.toLowerCase();

  // --- NAMA ---
  if (teksKecil.includes("nama saya")) {
    let nama = teks.split(/nama saya/i)[1].trim().split(" ")[0];
    nama = nama.replace(/[^a-zA-Z ]/g, "");
    if (nama) catat(nama, "nama");
    return;
  }

  // --- SUKA ---
  if (teksKecil.includes("saya suka")) {
    let suka = teks.split(/saya suka/i)[1].trim();
    if (suka) catat(suka, "suka");
    return;
  }

  // --- KOTA / TINGGAL ---
  if (teksKecil.includes("saya tinggal di") || teksKecil.includes("saya di")) {
    let kota = teks.split(/saya (tinggal di|di)/i)[2]?.trim();
    if (kota) catat(kota, "kota");
    return;
  }

  // --- PEKERJAAN ---
  if (teksKecil.includes("kerja saya") || teksKecil.includes("saya kerja")) {
    let pekerjaan = teks.split(/saya kerja( sebagai)?/i)[1]?.trim();
    if (pekerjaan) catat(pekerjaan, "pekerjaan");
    return;
  }

  // --- PERASAAN LENGKAP ---
  if (teksKecil.includes("saya sedih")) { catat("sedih", "perasaan"); return; }
  if (teksKecil.includes("saya senang")) { catat("senang", "perasaan"); return; }
  if (teksKecil.includes("saya capek")) { catat("capek", "perasaan"); return; }
  if (teksKecil.includes("saya lapar")) { catat("lapar", "perasaan"); return; }
  if (teksKecil.includes("saya marah")) { catat("marah", "perasaan"); return; }
  if (teksKecil.includes("saya ngantuk")) { catat("ngantuk", "perasaan"); return; }
  if (teksKecil.includes("saya kesal")) { catat("kesal", "perasaan"); return; }

  // --- TOLONG INGAT MANUAL ---
  if (teksKecil.includes("tolong ingat")) {
    let isi = teks.split(/tolong ingat/i)[1].trim();
    if (isi) catat(isi, "catatan");
    return;
  }
}

// ==========================================
// 7. DAFTARKAN SUPAYA FILE LAIN BISA PINJAM
// ==========================================
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.simpanObrolan = simpanObrolan;
window.ambilObrolan = ambilObrolan;
window.catatOtomatis = catatOtomatis;

// Jembatan nama lama, biar file lama tidak error
window.ingat = catat;
window.ingatOtomatis = catatOtomatis;
window.ambilIngatan = ambilCatatan;
window.simpanChat = simpanObrolan;
