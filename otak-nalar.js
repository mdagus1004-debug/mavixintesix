// =================================================
// OTAK NALAR - BUKA LEMARI SAJA
// Dipanggil oleh: Otak Kecil saja, bukan Depan langsung
// Jawaban dibagi ke: Otak Kecil lagi, bukan ke Depan langsung
// Kalau kosong: return null, tidak ngarang
// =================================================
async function prosesNalar(teks) {
  const tAsli = teks.toLowerCase();
  const t = tAsli.replace(/\s+/g, "");

  // Tadi saya bilang apa - paling atas
  if (t.includes("tadisayabilangapa") || t.includes("tadisayabilang") || t.includes("tadisayabilangapa")) {
    const last = await ambilObrolanTerakhirUser();
    if (last) return "Tadi Bos bilang: " + last;
    return null;
  }

  // Cek pertanyaan: harus ada ? atau kata tanya jelas
  const isTanya =
    teks.includes("?") ||
    t.includes("siapa") ||
    t.includes("dimana") ||
    t.includes("dimanakah") ||
    t.includes("kapan") ||
    t.includes("kenapa") ||
    t.includes("bagaimana") ||
    t.includes("gimana") ||
    t.includes("berapa") ||
    t.includes("apakah") ||
    t.includes("apa");

  if (!isTanya) return null;

  const butuhNama = t.includes("namasaya") || t.includes("siapasaya") || t.includes("namaku") || t.includes("siapaaku");
  const butuhSuka = t.includes("sukasaya") || t.includes("apasuka") || t.includes("sukaapa") || t.includes("kesukaansaya");
  const butuhHobi = t.includes("hobisaya") || t.includes("hobiapa") || t.includes("apahobi");
  const butuhKota = t.includes("tinggaldimana") || t.includes("dimanatinggal") || t.includes("tinggaldimanakah") || t.includes("tinggaldisebelahmana");
  const butuhKerja = t.includes("kerjasaya") || t.includes("pekerjaansaya") || t.includes("kerjaapa");
  const butuhPerasaan = t.includes("perasaansaya") || t.includes("bagaimana perasaan") || t.includes("lagiapa");

  // GABUNGAN DULU - baru 1 data
  if (butuhNama && butuhSuka) {
    const n = ubahJadiTeks(await ambilCatatan("nama"));
    const s = ubahJadiTeks(await ambilCatatan("suka"));
    if (n && s) return "Nama Bos " + n + ", Bos suka " + s + ".";
    return null;
  }
  if (butuhNama && butuhKota) {
    const n = ubahJadiTeks(await ambilCatatan("nama"));
    const k = ubahJadiTeks(await ambilCatatan("kota"));
    if (n && k) return "Nama Bos " + n + ", Bos tinggal di " + k + ".";
    return null;
  }
  if (butuhNama && butuhHobi) {
    const n = ubahJadiTeks(await ambilCatatan("nama"));
    const h = ubahJadiTeks(await ambilCatatan("hobi"));
    if (n && h) return "Nama Bos " + n + ", hobi Bos " + h + ".";
    return null;
  }
  if (butuhSuka && butuhHobi) {
    const s = ubahJadiTeks(await ambilCatatan("suka"));
    const h = ubahJadiTeks(await ambilCatatan("hobi"));
    if (s && h) return "Bos suka " + s + ", hobi Bos " + h + ".";
    return null;
  }

  // 1 DATA SAJA
  if (butuhNama) {
    const n = ubahJadiTeks(await ambilCatatan("nama"));
    if (n) return "Nama Bos " + n + ".";
    return null;
  }
  if (butuhSuka) {
    const s = ubahJadiTeks(await ambilCatatan("suka"));
    if (s) return "Bos suka " + s + ".";
    return null;
  }
  if (butuhHobi) {
    const h = ubahJadiTeks(await ambilCatatan("hobi"));
    if (h) return "Hobi Bos " + h + ".";
    return null;
  }
  if (butuhKota) {
    const k = ubahJadiTeks(await ambilCatatan("kota"));
    if (k) return "Bos tinggal di " + k + ".";
    return null;
  }
  if (butuhKerja) {
    const p = ubahJadiTeks(await ambilCatatan("pekerjaan"));
    if (p) return "Kerja Bos " + p + ".";
    return null;
  }
  if (butuhPerasaan) {
    const f = ubahJadiTeks(await ambilCatatan("perasaan"));
    if (f) return "Bos sedang " + f + ".";
    return null;
  }

  return null;
}
