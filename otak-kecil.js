// ==========================================
// OTAK KECIL - Mavix - VERSI TANPA SPASI TOTAL
// ==========================================
// Tugas: Sapaan saja
// Aturan: 1. Semua cek TANPA SPASI, sama seperti Nalar
//         2. TIDAK BOLEH ada localStorage
//         3. TIDAK BOLEH ada ambilCatatan
// Alur: Manajer -> Kecil -> Nalar
// ==========================================

async function fikirKecil(teks) {
  if (!teks) return null;

  // TANPA SPASI TOTAL - Sama seperti Nalar
  // "Halo   Mavix" -> "halomavix"
  // "Selamat   Pagi" -> "selamatpagi"
  // "Terima   Kasih" -> "terimakasih"
  const t = teks.toLowerCase().replace(/\s+/g, "");

  // --- SAPAAN: HALO ---
  if (t === "halo" || t === "hai" || t === "hi" || t.includes("halomavix") || t.includes("halo,mavix")) {
    return "Halo Bos, ada di sini.";
  }

  // --- SAPAAN: TERIMA KASIH ---
  if (t.includes("terimakasih") || t.includes("makasih") || t.includes("thanks") || t.includes("thankyou")) {
    return "Sama-sama Bos.";
  }

  // --- SAPAAN: SELAMAT PAGI ---
  if (t.includes("selamatpagi") || t === "pagi" || t.includes("pagibos")) {
    return "Selamat pagi Bos.";
  }

  // --- SAPAAN: SELAMAT MALAM ---
  if (t.includes("selamatmalam") || t === "malam" || t.includes("malambos")) {
    return "Selamat malam Bos.";
  }

  // --- SAPAAN: SELAMAT SIANG ---
  if (t.includes("selamatsiang") || t === "siang" || t.includes("siangbos")) {
    return "Selamat siang Bos.";
  }

  // --- SAPAAN: SELAMAT SORE ---
  if (t.includes("selamatsore") || t === "sore" || t.includes("sorebos")) {
    return "Selamat sore Bos.";
  }

  // --- SAPAAN TAMBAHAN: APA KABAR ---
  if (t.includes("apakabar") || t.includes("gimanakabar") || t.includes("kabarmu")) {
    return "Kabar saya baik Bos, Bos gimana?";
  }

  // --- BUKAN SAPAAN, LEMPAR KE NALAR ---
  if (typeof prosesNalar === 'function') {
    return await prosesNalar(teks);
  }

  return null;
}

window.OtakKecil = {
  fikirKecil: fikirKecil
};
