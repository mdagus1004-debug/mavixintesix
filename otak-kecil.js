// ==========================================
// OTAK KECIL - Mavix
// Tugas: Jawab cepat dari ingatan
// Sekarang: Ngambil dari index di DB (by_kata)
// Yang lain biarin, tidak diubah
// ==========================================

// Ambil dari index di DB pakai cariKata
async function ambilDariIndex(kataKunci) {
  try {
    if (typeof cariKata !== 'function') return null;
    const hasil = await cariKata(kataKunci.toLowerCase());
    if (!hasil || hasil.length === 0) return null;
    // cariKata sudah sort paling baru paling atas
    return hasil[0].teks;
  } catch (e) {
    return null;
  }
}

// Fungsi lama, biarin saja - jangan hapus
function ambilCatatan(kunci) {
  try {
    const data = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    return data[kunci] || null;
  } catch (e) {
    return null;
  }
}

function ambilSemuaCatatan(kunci) {
  try {
    const data = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    const val = data[kunci];
    if (Array.isArray(val)) return val;
    if (val) return [val];
    return [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// OTAK KECIL UTAMA
// Urutan: Kecil -> Index DB dulu
// Ketemu = jawab, Tidak ketemu = return null -> lempar ke Tengah
// ==========================================
async function fikirKecil(teks) {
  if (!teks) return null;
  const t = teks.toLowerCase().trim();

  // 1. NAMA SAYA SIAPA
  if (t.includes("nama saya") || t.includes("siapa nama saya") || t.includes("namaku siapa")) {
    // Coba index dulu
    const dariIndex = await ambilDariIndex("nama");
    if (dariIndex) return "Nama Bos " + dariIndex + ".";
    // Kalau index kosong, coba laci lama (biarin)
    const lama = ambilCatatan("nama");
    if (lama) return "Nama Bos " + lama + ".";
    return null;
  }

  // 2. SAYA SUKA APA
  if (t.includes("saya suka apa") || t.includes("apa yang saya suka") || t.includes("aku suka apa")) {
    const dariIndex = await ambilDariIndex("suka");
    if (dariIndex) return "Dari chat Bos, Bos pernah bilang: " + dariIndex;
    const lama = ambilSemuaCatatan("suka");
    if (lama.length > 0) return "Bos suka " + lama.join(", ") + ".";
    return null;
  }

  // 3. HOBI SAYA APA
  if (t.includes("hobi saya") || t.includes("hobi ku") || t.includes("hobi aku")) {
    const dariIndex = await ambilDariIndex("hobi");
    if (dariIndex) return "Hobi Bos: " + dariIndex;
    const lama = ambilSemuaCatatan("hobi");
    if (lama.length > 0) return "Hobi Bos " + lama.join(", ") + ".";
    return null;
  }

  // 4. SAYA TINGGAL DIMANA
  if (t.includes("tinggal dimana") || t.includes("tinggal di mana") || t.includes("rumah saya dimana") || t.includes("kota saya")) {
    const dariIndex = await ambilDariIndex("tinggal");
    if (dariIndex) return "Bos tinggal di " + dariIndex + ".";
    const lama = ambilCatatan("tinggal") || ambilCatatan("kota");
    if (lama) return "Bos tinggal di " + lama + ".";
    return null;
  }

  // 5. PEKERJAAN SAYA APA
  if (t.includes("pekerjaan saya") || t.includes("kerja saya") || t.includes("kerja apa")) {
    const dariIndex = await ambilDariIndex("kerja");
    if (dariIndex) return "Kerja Bos: " + dariIndex;
    const lama = ambilCatatan("kerja") || ambilCatatan("pekerjaan");
    if (lama) return "Kerja Bos " + lama + ".";
    return null;
  }

  // 6. PERASAAN / KEADAAN TERAKHIR
  if (t.includes("gimana perasaan") || t.includes("perasaan saya") || t.includes("aku lagi apa")) {
    const dariIndex = await ambilDariIndex("perasaan");
    if (dariIndex) return "Terakhir Bos bilang: " + dariIndex;
    return null;
  }

  // 7. ULANGI CHAT TERAKHIR / APA YANG BARU SAYA BILANG
  if (t.includes("tadi saya bilang apa") || t.includes("apa yang baru saya bilang") || t.includes("terakhir saya bilang")) {
    const dariIndex = await ambilDariIndex("saya");
    if (dariIndex) return "Terakhir Bos bilang: " + dariIndex;
    return null;
  }

  // 8. SAPAAN BIASA - tidak perlu index
  if (t === "halo" || t === "hai" || t === "hi" || t.includes("halo mavix")) {
    return "Halo Bos, ada di sini.";
  }
  if (t.includes("terima kasih") || t.includes("makasih")) {
    return "Sama-sama Bos.";
  }
  if (t.includes("selamat pagi")) return "Selamat pagi Bos.";
  if (t.includes("selamat malam")) return "Selamat malam Bos.";

  // Tidak ketemu -> kembalikan null, Manajer lempar ke Tengah
  return null;
}

// Buka ke luar, biar Manajer bisa panggil
window.OtakKecil = {
  fikirKecil: fikirKecil,
  ambilDariIndex: ambilDariIndex
};
