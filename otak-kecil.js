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
  return null;
}
window.pikirKecil = pikirKecil;
window.fikirKecil = pikirKecil;
window.OtakKecil = { fikirKecil: function(teks, cb){ const j = pikirKecil(teks); if(typeof cb === 'function' && j) cb(j); return j; }, pikirKecil: function(teks, cb){ return this.fikirKecil(teks, cb); }, fikir: function(teks, cb){ return this.fikirKecil(teks, cb); } };
