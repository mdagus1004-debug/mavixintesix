// ==========================================
// OTAK NALAR - Mavix - VERSI TANPA SPASI + PINTAR NEBAK
// ==========================================
// Tugas: Jawab dari lemari saja
// Aturan: 1. Semua cek TANPA SPASI
//         2. Buka laci CUMA yang ditanya
//         3. Tidak boleh ngarang
// Alur: Kecil -> Nalar -> Gudang

function ubahJadiTeks(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    return data.join(", ");
  }
  if (typeof data === "string") {
    if (data.trim() === "") return null;
    return data;
  }
  return String(data);
}

async function prosesNalar(teks) {
  if (!teks) return null;

  // 1. TANPA SPASI TOTAL - Ini kuncinya
  // "Siapa   Saya" -> "siapasaya"
  // "Di Mana" -> "dimana"
  // "Apa Kesukaan Saya" -> "apakesukaansaya"
  const t = teks.toLowerCase().replace(/\s+/g, "");
  const asli = teks;

  // 2. CEK APAKAH INI PERTANYAAN - Semua tanpa spasi
  const isTanya =
    t.includes("?") ||
    t.includes("siapa") ||
    t.includes("sapa") || // typo siapa
    t.includes("apa") ||
    t.includes("apah") || // typo apa
    t.includes("dimana") ||
    t.includes("mana") ||
    t.includes("kapan") ||
    t.includes("kenapa") ||
    t.includes("knp") || // singkatan kenapa
    t.includes("mengapa") ||
    t.includes("bagaimana") ||
    t.includes("gimana") ||
    t.includes("berapa") ||
    t.includes("brapa");

  if (!isTanya) return null;

  // 3. PINTAR NEBAK - Tebak laci apa yang ditanya, SEBELUM buka lemari
  const butuhNama =
    t.includes("nama") ||
    t.includes("siapasaya") ||
    t.includes("siapaaku") ||
    t.includes("siapanamaku") ||
    t.includes("namaku") ||
    t.includes("namaaku") ||
    t.includes("namagw");

  const butuhSuka =
    t.includes("suka") ||
    t.includes("kesukaan") ||
    t.includes("favorit") ||
    t.includes("favorite");

  const butuhHobi = t.includes("hobi");

  const butuhKota =
    t.includes("tinggal") ||
    t.includes("rumah") ||
    t.includes("kota") ||
    t.includes("domisili") ||
    t.includes("alamat");

  const butuhKerja =
    t.includes("pekerjaan") ||
    t.includes("kerja") ||
    t.includes("kerjaan") ||
    t.includes("profesi") ||
    t.includes("job");

  const butuhRasa =
    t.includes("perasaan") ||
    t.includes("gimanaaku") ||
    t.includes("akulagiapa") ||
    t.includes("sayalagiapa") ||
    t.includes("keadaansaya") ||
    t.includes("kabarsaya") ||
    t.includes("lagiapa") ||
    t.includes("lagingapain");

  const butuhTadi =
    t.includes("tadisayabilang") ||
    t.includes("tadiakubilang") ||
    t.includes("barusayabilang") ||
    t.includes("terakhirsayabilang") ||
    t.includes("apayangsayabilang") ||
    t.includes("chatterakhirsaya");

  // Kalau tidak ada laci yang ketebak, bukan urusan Nalar
  if (!butuhNama && !butuhSuka && !butuhHobi && !butuhKota && !butuhKerja && !butuhRasa && !butuhTadi) {
    return null;
  }

  // 4. BUKA LACI CUMA YANG DITANYA - Ini hematnya
  let nama = null;
  let suka = null;
  let hobi = null;
  let kota = null;
  let kerja = null;
  let rasa = null;

  if (typeof ambilCatatan === "function") {
    if (butuhNama) nama = ubahJadiTeks(await ambilCatatan("nama"));
    if (butuhSuka) suka = ubahJadiTeks(await ambilCatatan("suka"));
    if (butuhHobi) hobi = ubahJadiTeks(await ambilCatatan("hobi"));
    if (butuhKota) kota = ubahJadiTeks(await ambilCatatan("kota"));
    if (butuhKerja) kerja = ubahJadiTeks(await ambilCatatan("pekerjaan"));
    if (butuhRasa) rasa = ubahJadiTeks(await ambilCatatan("perasaan"));
  }

  // 5. JAWAB GABUNGAN - Dicek paling atas biar tidak ketutup jawaban 1
  if (butuhNama && butuhSuka && nama && suka) {
    return "Nama Bos " + nama + ", Bos suka " + suka + ".";
  }
  if (butuhNama && butuhKota && nama && kota) {
    return "Nama Bos " + nama + ", Bos tinggal di " + kota + ".";
  }
  if (butuhNama && butuhHobi && nama && hobi) {
    return "Nama Bos " + nama + ", hobi Bos " + hobi + ".";
  }
  if (butuhSuka && butuhHobi && suka && hobi) {
    return "Bos suka " + suka + ", hobi Bos " + hobi + ".";
  }

  // 6. JAWAB 1 LACI
  if (butuhNama && (t.includes("namasaya") || t.includes("namaku") || t.includes("siapanama") || t.includes("siapasaya") || t.includes("siapaaku") || t.includes("namaaku") || t.includes("namagw"))) {
    if (nama) return "Nama Bos " + nama + ".";
  }

  if (butuhSuka) {
    if (suka) return "Bos suka " + suka + ".";
  }

  if (butuhHobi) {
    if (hobi) return "Hobi Bos " + hobi + ".";
  }

  if (butuhKota) {
    if (kota) return "Bos tinggal di " + kota + ".";
  }

  if (butuhKerja) {
    if (kerja) return "Pekerjaan Bos " + kerja + ".";
  }

  if (butuhRasa) {
    if (rasa) return "Perasaan Bos " + rasa + ".";
  }

  // 7. TADI SAYA BILANG - Ini tidak pakai laci, pakai obrolan
  if (butuhTadi) {
    if (typeof ambilObrolanTerakhir === "function") {
      const terakhir = await ambilObrolanTerakhir();
      if (terakhir) return "Tadi Bos bilang: " + terakhir;
    }
    return null;
  }

  // Kalau laci kosong, jangan ngarang
  return null;
}

window.OtakNalar = {
  prosesNalar: prosesNalar
};
