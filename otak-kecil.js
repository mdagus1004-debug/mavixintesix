// ==========================================
// File: otak-kecil.js - VERSI BAHASA INDONESIA
// Nama: Otak Kecil / Satpam Depan
// Tugas: CUMA JAWAB, TIDAK BOLEH CATAT
// Yang catat cuma catatOtomatis() di otak-ingatan.js
// ==========================================

function pikirKecil(teks) {
  if (!teks) return null;
  const teksKecil = teks.toLowerCase().trim();

  // 1. SALAM
  if (teksKecil.includes("halo") || teksKecil.includes("hai") || teksKecil.includes("selamat pagi") || teksKecil.includes("selamat malam") || teksKecil.includes("assalamualaikum")) {
    return "Halo Bos, ada yang bisa saya bantu?";
  }

  // 2. TANYA NAMA - CUMA BACA, TIDAK CATAT
  if (teksKecil.includes("siapa nama saya") || teksKecil.includes("nama saya siapa") || teksKecil.includes("kamu tau nama saya")) {
    const nama = (typeof ambilCatatan === 'function' ? ambilCatatan("nama") : null) || (typeof ambilIngatan === 'function' ? ambilIngatan("nama") : null);
    if (nama) {
      return "Nama Bos " + nama + ".";
    } else {
      return "Saya belum tahu nama Bos. Nama Bos siapa?";
    }
  }

  // 3. TANYA SUKA - CUMA BACA, TIDAK CATAT
  if (teksKecil.includes("saya suka apa") || teksKecil.includes("apa yang saya suka") || teksKecil.includes("saya sukanya apa")) {
    const suka = (typeof ambilCatatan === 'function' ? ambilCatatan("suka") : null) || (typeof ambilIngatan === 'function' ? ambilIngatan("suka") : null);
    if (suka) {
      return "Bos suka " + suka + ".";
    } else {
      return "Bos belum pernah bilang Bos suka apa.";
    }
  }

  // 4. TANYA PERASAAN - CUMA BACA, TIDAK CATAT
  if (teksKecil.includes("perasaan saya") || teksKecil.includes("gimana perasaan saya") || teksKecil.includes("saya lagi apa")) {
    const perasaan = (typeof ambilCatatan === 'function' ? ambilCatatan("perasaan") : null) || (typeof ambilIngatan === 'function' ? ambilIngatan("perasaan") : null);
    if (perasaan) {
      return "Tadi Bos bilang Bos " + perasaan + ".";
    } else {
      return "Bos belum cerita perasaan Bos hari ini.";
    }
  }

  // 5. TANYA KOTA - CUMA BACA, TIDAK CATAT
  if (teksKecil.includes("saya tinggal di mana") || teksKecil.includes("saya di mana") || teksKecil.includes("rumah saya di mana")) {
    const kota = (typeof ambilCatatan === 'function' ? ambilCatatan("kota") : null) || (typeof ambilIngatan === 'function' ? ambilIngatan("kota") : null);
    if (kota) {
      return "Bos tinggal di " + kota + ".";
    } else {
      return "Saya belum tahu Bos tinggal di mana.";
    }
  }

  // 6. TANYA PEKERJAAN - CUMA BACA, TIDAK CATAT
  if (teksKecil.includes("kerja saya apa") || teksKecil.includes("saya kerja apa")) {
    const pekerjaan = (typeof ambilCatatan === 'function' ? ambilCatatan("pekerjaan") : null) || (typeof ambilIngatan === 'function' ? ambilIngatan("pekerjaan") : null);
    if (pekerjaan) {
      return "Bos kerja " + pekerjaan + ".";
    } else {
      return "Bos belum pernah bilang Bos kerja apa.";
    }
  }

  // 7. APA KABAR
  if (teksKecil.includes("apa kabar") || teksKecil.includes("gimana kabar") || teksKecil.includes("kabar kamu")) {
    return "Kabar saya baik, Bos. Bos sendiri gimana?";
  }

  // 8. MAU TIDUR / NGANTUK
  if (teksKecil.includes("mau tidur") || teksKecil.includes("ngantuk") || teksKecil.includes("mau bobo")) {
    return "Oke Bos, selamat istirahat ya. Jangan lupa minum air.";
  }

  // 9. LAPAR
  if (teksKecil.includes("saya lapar")) {
    return "Wah, Bos lapar ya? Makan dulu, Bos. Jangan tahan lapar.";
  }

  // 10. MARAH
  if (teksKecil.includes("saya marah") || teksKecil.includes("saya kesal")) {
    return "Sabar ya, Bos. Tarik napas dulu. Cerita saja sama saya, kenapa Bos marah?";
  }

  // 11. TERIMA KASIH
  if (teksKecil.includes("terima kasih") || teksKecil.includes("makasih") || teksKecil.includes("thanks")) {
    return "Sama-sama, Bos. Senang bisa bantu.";
  }

  // 12. SIAPA KAMU
  if (teksKecil.includes("kamu siapa") || teksKecil.includes("nama kamu")) {
    return "Saya Mavix, Bos. Asisten Bos.";
  }

  // Kalau tidak kenal, TOLAK. Biar dilempar ke Otak Tengah / Server.
  return null;
}

// ==========================================
// JEMBATAN - INI YANG DULU HILANG, BOS
// Biar index.html yang panggil OtakKecil.fikirKecil(teks, callback) bisa nyambung
// ==========================================
window.pikirKecil = pikirKecil;
window.fikirKecil = pikirKecil;

window.OtakKecil = {
  // Bisa dipanggil 2 cara:
  // 1. OtakKecil.fikirKecil("halo", callback) - cara index.html
  // 2. OtakKecil.fikirKecil("halo") - cara lama, langsung return string
  fikirKecil: function(teks, callback) {
    const jawab = pikirKecil(teks);
    if (typeof callback === 'function') {
      if (jawab) callback(jawab);
      // Kalau jawab null, jangan panggil callback. Biar index.html lanjut ke server.
      return jawab;
    }
    return jawab;
  },
  pikirKecil: function(teks, callback) {
    return this.fikirKecil(teks, callback);
  },
  fikir: function(teks, callback) {
    return this.fikirKecil(teks, callback);
  }
};
