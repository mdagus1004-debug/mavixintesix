// OTAK KECIL - SATPAM DEPAN - VERSI PERBAIKAN
function pikirKecil(teks) {
  if (!teks) return null;
  const t = teks.toLowerCase().trim();

  // === PERBAIKAN 1: STOP - HARUS PALING ATAS ===
  if (t.includes("stop") || t.includes("diam") || t.includes("berhenti") || t.includes("jangan ngomong") || t.includes("cukup")) {
    return "__STOP__";
  }

  // === PERBAIKAN 2: JAM - PAKAI JAM HP BOS, BUKAN JAM SERVER ===
  if (t.includes("jam berapa") || t.includes("pukul berapa") || t.includes("sekarang jam")) {
    const sekarang = new Date();
    let jam = sekarang.getHours();
    let menit = sekarang.getMinutes().toString().padStart(2, "0");
    return "Sekarang jam " + jam + ":" + menit + ", Bos.";
  }

  // === TANYA INGATAN - CEK DULU YANG PANJANG, BARU YANG PENDEK ===
  if (t.includes("siapa nama saya") || t.includes("nama saya siapa") || t.includes("kamu tau nama saya")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("nama") : null);
    return v ? "Nama Bos " + v + "." : "Saya belum tahu nama Bos. Nama Bos siapa?";
  }
  if (t.includes("saya suka apa") || t.includes("apa yang saya suka")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("suka") : null);
    return v ? "Bos suka " + v + "." : "Bos belum pernah bilang Bos suka apa.";
  }
  if (t.includes("hobi saya apa") || t.includes("apa hobi saya")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("hobi") : null);
    return v ? "Hobi Bos " + v + "." : "Bos belum pernah bilang hobi Bos apa.";
  }
  if (t.includes("makanan favorit saya") || t.includes("makanan saya apa") || t.includes("saya suka makan apa")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("makanan") : null);
    return v ? "Makanan favorit Bos " + v + "." : "Bos belum pernah bilang makanan favorit Bos.";
  }
  if (t.includes("minuman favorit saya") || t.includes("minuman saya apa") || t.includes("saya suka minum apa")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("minuman") : null);
    return v ? "Minuman favorit Bos " + v + "." : "Bos belum pernah bilang minuman favorit Bos.";
  }
  if (t.includes("perasaan saya") || t.includes("saya lagi apa")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("perasaan") : null);
    return v ? "Tadi Bos bilang Bos " + v + "." : "Bos belum cerita perasaan Bos hari ini.";
  }
  if (t.includes("saya tinggal di mana") || t.includes("saya di mana") || t.includes("rumah saya di mana")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("kota") : null);
    return v ? "Bos tinggal di " + v + "." : "Saya belum tahu Bos tinggal di mana.";
  }
  if (t.includes("kerja saya apa") || t.includes("saya kerja apa")) {
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("pekerjaan") : null);
    return v ? "Bos kerja " + v + "." : "Bos belum pernah bilang Bos kerja apa.";
  }

  // === PERASAAN ===
  if (t.includes("saya marah") || t.includes("saya kesal")) return "Sabar ya, Bos. Tarik napas dulu. Cerita saja sama saya, kenapa Bos marah?";
  if (t.includes("saya lapar")) return "Wah, Bos lapar ya? Makan dulu, Bos. Jangan tahan lapar.";
  if (t.includes("mau tidur") || t.includes("ngantuk") || t.includes("mau bobo")) return "Oke Bos, selamat istirahat ya. Jangan lupa minum air.";

  // === SAPAAN - PINDAH KE BAWAH, BIAR TIDAK RAKUS ===
  if (t.includes("halo") || t.includes("hai") || t.includes("selamat pagi") || t.includes("selamat malam") || t.includes("assalamualaikum")) return "Halo Bos, ada yang bisa saya bantu?";
  if (t.includes("apa kabar") || t.includes("gimana kabar") || t.includes("kabar kamu")) return "Kabar saya baik, Bos. Bos sendiri gimana?";
  if (t.includes("terima kasih") || t.includes("makasih") || t.includes("thanks")) return "Sama-sama, Bos. Senang bisa bantu.";
  if (t.includes("kamu siapa") || t.includes("nama kamu")) return "Saya Mavix, Bos. Asisten Bos.";
  return null;
}
window.pikirKecil = pikirKecil;
window.fikirKecil = pikirKecil;
window.OtakKecil = {
  fikirKecil: function(teks, callback) { const j = pikirKecil(teks); if (typeof callback === 'function' && j) callback(j); return j; },
  pikirKecil: function(teks, callback) { return this.fikirKecil(teks, callback); },
  fikir: function(teks, callback) { return this.fikirKecil(teks, callback); }
};
