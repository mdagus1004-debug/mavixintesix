// =================================================
// OTAK KECIL - SAPAAN SAJA
// Dipanggil oleh: Otak Depan
// Yang manggil Nalar: Kecil ini, bukan Depan
// Jawaban dibagi ke: Otak Depan
// =================================================
async function fikirKecil(teks) {
  const t = teks.toLowerCase().trim().replace(/\s+/g, "").replace(/\?/g, "").replace(/!/g, "").replace(/\./g, "");

  // Sapaan murni saja, pakai === biar tidak motong pertanyaan
  if (t === "halo" || t === "hai" || t === "hallo" || t === "hi" || t === "hei") {
    return "Halo Bos, ada di sini.";
  }
  if (t === "selamatpagi") return "Selamat pagi Bos.";
  if (t === "selamatsiang") return "Selamat siang Bos.";
  if (t === "selamatsore") return "Selamat sore Bos.";
  if (t === "selamatmalam") return "Selamat malam Bos.";
  if (t === "apakabar" || t === "apa kabar") return "Kabar saya baik Bos, Bos gimana?";
  if (t === "terimakasih" || t === "makasih" || t === "thankyou" || t === "thanks") return "Sama-sama Bos.";
  if (t === "dadah" || t === "bye" || t === "dadahbos") return "Dadah Bos, hati-hati.";
  if (t === "oke" || t === "ok" || t === "sip") return "Oke Bos, siap.";
  if (t === "baik" || t === "baikbos") return "Baik Bos.";

  // Kalau bukan sapaan murni, Kecil manggil Nalar
  // Nalar jawab ke Kecil, Kecil teruskan ke Depan
  const jawabNalar = await prosesNalar(teks);
  return jawabNalar; // bisa isi, bisa null
}

window.OtakKecil = { fikir: fikirKecil, fikirKecil: fikirKecil };
