// OTAK NALAR - MAVIX V2.4 - BACA LEMARI, JAWAB SOAL BOS
// Perbaikan: isTanya apa dicek di awal saja
async function fikirNalar(teks) {
  const t = teks.toLowerCase().trim().replace(/\s+/g, "");
  const tAsli = teks.toLowerCase().trim();
  const tanyaNama = t.includes("siapanamaku") || t.includes("siapanamasaya") || t.includes("siapasaya") || t.includes("namasayasiapa") || t.includes("namakusiapa");
  const tanyaSuka = t.includes("apasayasukai") || t.includes("apayangsayasukai") || t.includes("apasukasaya");
  const tanyaHobi = t.includes("apahobisaya") || t.includes("hobisayaapa");
  const tanyaKota = t.includes("sayatinggaldimana") || t.includes("sayatinggaldi") || t.includes("dimanatinggalsaya") || t.includes("kotatinggalsaya") || t.includes("kotatinggal") || t.includes("dimanasayatinggal");
  const tanyaKerja = t.includes("apakerjasaya") || t.includes("kerjasayaapa") || t.includes("pekerjaansayaapa") || t.includes("apa pekerjaansaya");
  const tanyaPerasaan = t.includes("apakabar") || t.includes("bagaimanaperasaan") || t.includes("gimanaperasaansaya") || t.includes("perasaansayaapa");
  const tanyaSemua = t.includes("apayangkamutahu") || t.includes("apayangkamutahutentang") || t.includes("tentangsaya");
  const isTanya = tAsli.includes("?") || t.startsWith("apa") || tAsli.includes(" apa ") || t.includes("siapa") || t.includes("berapa") || t.includes("dimana") || t.includes("kapan") || t.includes("kenapa") || t.includes("bagaimana") || t.includes("gimana");
  if (!isTanya) return null;
  if (tanyaNama) {
    const nama = ubahJadiTeks(await ambilCatatan("nama"));
    if (nama) return "Nama Bos adalah " + nama + ".";
    return "Bos belum pernah bilang nama Bos ke saya.";
  }
  if (tanyaSuka) {
    const suka = ubahJadiTeks(await ambilCatatan("suka"));
    if (suka) return "Bos suka " + suka + ".";
    return "Bos belum pernah bilang Bos suka apa.";
  }
  if (tanyaHobi) {
    const hobi = ubahJadiTeks(await ambilCatatan("hobi"));
    if (hobi) return "Hobi Bos adalah " + hobi + ".";
    return "Bos belum pernah bilang hobi Bos.";
  }
  if (tanyaKota) {
    const kota = ubahJadiTeks(await ambilCatatan("kota"));
    if (kota) return "Bos tinggal di " + kota + ".";
    return "Bos belum pernah bilang Bos tinggal di mana.";
  }
  if (tanyaKerja) {
    const kerja = ubahJadiTeks(await ambilCatatan("pekerjaan"));
    if (kerja) return "Kerja Bos adalah " + kerja + ".";
    return "Bos belum pernah bilang kerja Bos apa.";
  }
  if (tanyaPerasaan) {
    const rasa = ubahJadiTeks(await ambilCatatan("perasaan"));
    if (rasa) return "Tadi Bos bilang Bos lagi " + rasa + ". Semoga cepat membaik ya Bos.";
    return "Saya baik Bos. Bos sendiri gimana?";
  }
  if (tanyaSemua) {
    const nama = ubahJadiTeks(await ambilCatatan("nama"));
    const suka = ubahJadiTeks(await ambilCatatan("suka"));
    const hobi = ubahJadiTeks(await ambilCatatan("hobi"));
    const kota = ubahJadiTeks(await ambilCatatan("kota"));
    const kerja = ubahJadiTeks(await ambilCatatan("pekerjaan"));
    const rasa = ubahJadiTeks(await ambilCatatan("perasaan"));
    let out = "Ini yang saya ingat tentang Bos:";
    if (nama) out += "\nNama: " + nama;
    if (suka) out += "\nSuka: " + suka;
    if (hobi) out += "\nHobi: " + hobi;
    if (kota) out += "\nTinggal di: " + kota;
    if (kerja) out += "\nKerja: " + kerja;
    if (rasa) out += "\nPerasaan: " + rasa;
    if (!nama && !suka && !hobi && !kota && !kerja && !rasa) return "Saya belum ingat apa-apa tentang Bos. Ceritakan dulu ya Bos.";
    return out;
  }
  if (tAsli.includes("tadi saya bilang") || tAsli.includes("tadi aku bilang")) {
    const terakhir = await ambilObrolanTerakhirUser();
    if (terakhir) return "Tadi Bos bilang: " + terakhir;
    return "Bos belum bilang apa-apa tadi.";
  }
  return null;
}
