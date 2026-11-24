// kataTanya - ASLI, TIDAK DIHAPUS
const kataTanya = {
  apa: [
    "ap", "pa",
    "apaa", "apaaa", "aapa", "aaapa",
    "appan", "apatuh",
    "apa itu", "apaitu",
    "apasih", "apa sih",
    "apa tuh", "apa tu",
    "apa aja", "apaaja",
    "apa saja", "apasaja",
    "ape", "apo"
  ],

  siapa: [
    "sp", "sapa", "siapa",
    "siapaa", "siapaaa", "siapaa",
    "sape", "sapa tu", "siapa tu",
    "siapa tuh", "siapa sih", "siapasih",
    "siapa aja", "siapaaja",
    "siapa saja", "siapasaja",
    "sape ni", "siapa ni",
    "siapa ya"
  ],

  kapan: [
    "kp", "kpn", "kapan",
    "kapaan", "kapann", "kapaaan",
    "kapan sih", "kapansih",
    "bila", "bilaa", "bila ya",
    "kapan ya"
  ],

  dimana: [
    "dmn", "dmana", "dimana",
    "dimna", "dimaana", "dimaanaa",
    "dimana sih", "dimanasih",
    "dimana tuh", "dimana tu",
    "dimana aja", "dimanaaja", "dimana saja", "dimanasaja",
    "mana", "manaa", "di mana", "di mana tuh",
    "dimana nih", "di mana ya",
    "kat mana", "katmana", "kat mana tu"
  ],

  mengapa: [
    "mngp", "mengapa", "mengapaa",
    "kenapa", "knp", "kenapaa", "knapa",
    "mengapa sih", "mengapasih",
    "kenapa sih", "kenapasih",
    "kenapa tuh", "kenapa tu",
    "mengapa tuh", "mengapa tu",
    "kenapa ya", "mengapa ya",
    "kok", "kok bisa", "kenapa kok",
    "pasal apa", "pasaipa", "nape", "nape ni"
  ],

  bagaimana: [
    "bgm", "bgmn", "bagaimana",
    "bagaimna", "bagaimanaa", "bagaimnaa",
    "gimana", "gmna", "gmn", "gimna",
    "bagaimana sih", "bagaimanasih",
    "gimana sih", "gimana sih",
    "gimana tuh", "gimana tu",
    "bagaimana tuh", "bagaimana tu",
    "macam mana", "macammana", "cm mana",
    "camne", "cmne", "mcm mana"
  ],

  berapa: [
    "brp", "berapa", "berapaa",
    "berapa sih", "berapasih",
    "berapa tuh", "berapa tu",
    "berapa ya", "berapa ni",
    "brape", "brape ni",
    "berapa harga", "berapa harganya"
  ]
};

// OTAK KECIL - SATPAM DEPAN - VERSI BETUL
function pikirKecil(teks){
  if(!teks) return null;
  const t = teks.toLowerCase().trim();
  // Ambil yang terakhir saja kalau masih ketumpuk
  let pot = t.split(/[,.\n]| eh | terus | lalu /);
  let tt = pot[pot.length - 1].trim();
  if(tt === "" && pot.length > 1) tt = pot[pot.length - 2].trim();
  if(!tt) tt = t;
  // Kata pendek - ini yang dulu tidak dikenal
  if(tt === "siapa" || tt === "siapa?" || tt === "kamu siapa") return "Saya Mavix, Bos. Asisten Bos.";
  if(tt === "dimana" || tt === "dimana?" || tt === "di mana" || tt === "kamu dimana" || tt === "kamu di mana") return "Saya di sini, Bos. Di Chromebook Bos.";
  if(tt === "hallo" || tt === "halo" || tt === "hai" || tt === "hei") return "Halo Bos, ada yang bisa saya bantu?";
  // STOP paling atas
  if(tt.includes("stop") || tt.includes("diam") || tt.includes("berhenti") || tt.includes("jangan ngomong") || tt.includes("cukup")) return "__STOP__";
  if(tt.includes("jam berapa") || tt.includes("pukul berapa") || tt.includes("sekarang jam")){
    const s = new Date(); let jam = s.getHours(); let menit = s.getMinutes().toString().padStart(2, "0");
    return "Sekarang jam " + jam + ":" + menit + ", Bos.";
  }
  if(tt.includes("siapa nama saya") || tt.includes("nama saya siapa") || tt.includes("kamu tau nama saya")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("nama") : null);
    return v ? "Nama Bos " + v + "." : "Saya belum tahu nama Bos. Nama Bos siapa?";
  }
  if(tt.includes("saya suka apa") || tt.includes("apa yang saya suka")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("suka") : null);
    return v ? "Bos suka " + v + "." : "Bos belum pernah bilang Bos suka apa.";
  }
  if(tt.includes("hobi saya apa") || tt.includes("apa hobi saya")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("hobi") : null);
    return v ? "Hobi Bos " + v + "." : "Bos belum pernah bilang hobi Bos apa.";
  }
  if(tt.includes("makanan favorit saya") || tt.includes("makanan saya apa") || tt.includes("saya suka makan apa")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("makanan") : null);
    return v ? "Makanan favorit Bos " + v + "." : "Bos belum pernah bilang makanan favorit Bos.";
  }
  if(tt.includes("minuman favorit saya") || tt.includes("minuman saya apa") || tt.includes("saya suka minum apa")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("minuman") : null);
    return v ? "Minuman favorit Bos " + v + "." : "Bos belum pernah bilang minuman favorit Bos.";
  }
  if(tt.includes("perasaan saya") || tt.includes("saya lagi apa")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("perasaan") : null);
    return v ? "Tadi Bos bilang Bos " + v + "." : "Bos belum cerita perasaan Bos hari ini.";
  }
  if(tt.includes("saya tinggal di mana") || tt.includes("saya di mana") || tt.includes("rumah saya di mana")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("kota") : null);
    return v ? "Bos tinggal di " + v + "." : "Saya belum tahu Bos tinggal di mana.";
  }
  if(tt.includes("kerja saya apa") || tt.includes("saya kerja apa")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("pekerjaan") : null);
    return v ? "Bos kerja " + v + "." : "Bos belum pernah bilang Bos kerja apa.";
  }
  if(tt.includes("saya marah") || tt.includes("saya kesal")) return "Sabar ya, Bos. Tarik napas dulu. Cerita saja sama saya, kenapa Bos marah?";
  if(tt.includes("saya lapar")) return "Wah, Bos lapar ya? Makan dulu, Bos. Jangan tahan lapar.";
  if(tt.includes("mau tidur") || tt.includes("ngantuk") || tt.includes("mau bobo")) return "Oke Bos, selamat istirahat ya. Jangan lupa minum air.";
  if(tt.includes("halo") || tt.includes("hai") || tt.includes("selamat pagi") || tt.includes("selamat malam") || tt.includes("assalamualaikum")) return "Halo Bos, ada yang bisa saya bantu?";
  if(tt.includes("apa kabar") || tt.includes("gimana kabar") || tt.includes("kabar kamu")) return "Kabar saya baik, Bos. Bos sendiri gimana?";
  if(tt.includes("terima kasih") || tt.includes("makasih") || tt.includes("thanks")) return "Sama-sama, Bos. Senang bisa bantu.";
  if(tt.includes("kamu siapa") || tt.includes("nama kamu")) return "Saya Mavix, Bos. Asisten Bos.";
  // TAMBAHAN BARU: DETEKSI kataTanya - tidak ada yang dihapus di atas
  for (const jenis in kataTanya) {
    if (kataTanya[jenis].some(k => tt === k || tt.startsWith(k + " "))) {
      if (jenis === "siapa") return "Siapa yang Bos maksud?";
      if (jenis === "dimana") return "Di mana yang Bos maksud?";
      if (jenis === "kapan") return "Kapan ya, Bos?";
      if (jenis === "mengapa") return "Kenapa ya, Bos? Coba cerita dulu.";
      if (jenis === "bagaimana") return "Gimana ya, Bos? Boleh jelaskan lagi?";
      if (jenis === "berapa") return "Berapa ya, Bos?";
      if (jenis === "apa") return "Apa ya, Bos? Boleh jelaskan lagi?";
    }
  }
  return null;
}
window.pikirKecil = pikirKecil;
window.fikirKecil = pikirKecil;
window.OtakKecil = { fikirKecil: function(teks, cb){ const j = pikirKecil(teks); if(typeof cb === 'function' && j) cb(j); return j; }, pikirKecil: function(teks, cb){ return this.fikirKecil(teks, cb); }, fikir: function(teks, cb){ return this.fikirKecil(teks, cb); } };
