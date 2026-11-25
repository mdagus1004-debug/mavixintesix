// OTAK KECIL - MAVIX V2.4 - SAPAAN + LEMPAR KE NALAR
// Perbaikan: hapus cek apa kabar yang mati
async function fikirKecil(teks) {
  const t = teks.toLowerCase().trim().replace(/\s+/g, "");
  if (t === "halo" || t === "hai" || t === "hi" || t === "hei" || t === "helo" || t === "selamatpagi" || t === "selamatsiang" || t === "selamatmalam" || t === "selamatsore") {
    return "Halo Bos, ada yang bisa saya bantu?";
  }
  if (t === "apakabar") {
    return "Saya baik Bos, Bos sendiri gimana?";
  }
  if (t === "terimakasih" || t === "makasih" || t === "thanks" || t === "thankyou" || t === "trims") {
    return "Sama-sama Bos, senang bisa bantu.";
  }
  if (t === "selamatpagi" || t === "pagi") return "Selamat pagi Bos.";
  if (t === "siang") return "Selamat siang Bos.";
  if (t === "malam") return "Selamat malam Bos.";
  if (t === "oke" || t === "ok" || t === "okay" || t === "siap" || t === "baik" || t === "mantap" || t === "bagus") {
    return "Siap Bos.";
  }
  if (t === "dadah" || t === "bye" || t === "sampaijumpa" || t === "daag") {
    return "Dadah Bos, sampai jumpa lagi.";
  }
  if (t.includes("sukasaya") || t.includes("hobisaya") || t.includes("tinggalsaya") || t.includes("namasaya") || t.includes("kerjasaya") || t.includes("pekerjaansaya") || t.includes("perasaansaya") || t.includes("tadisayabilang") || t.includes("siapanamaku") || t.includes("siapasaya") || t.includes("apahobisaya") || t.includes("apakabarsaya")) {
    const hasilNalar = await fikirNalar(teks);
    if (hasilNalar) return hasilNalar;
  }
  return null;
}
