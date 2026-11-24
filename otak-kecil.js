// OTAK KECIL - SATPAM DEPAN V4
// Aturan ngomong: Baru jadi jawaban utama, lama jadi tambahan info
// Aturan: Pilih dulu sebelum ngomong, jangan ngomong semua

function pikirKecil(teks){
  if(!teks) return null;
  const t = teks.toLowerCase().trim();
  let pot = t.split(/[,.\n]| eh | terus | lalu /);
  let tt = pot[pot.length - 1].trim();
  if(tt === "" && pot.length > 1) tt = pot[pot.length - 2].trim();
  if(!tt) tt = t;

  // Kata pendek
  if(tt === "siapa" || tt === "kamu siapa") return "Saya Mavix, Bos. Asisten Bos.";
  if(tt === "dimana" || tt === "di mana" || tt === "kamu dimana") return "Saya di sini, Bos. Di Chromebook Bos.";
  if(tt === "hallo" || tt === "halo" || tt === "hai" || tt === "hei") return "Halo Bos, ada yang bisa saya bantu?";

  // STOP paling atas
  if(tt.includes("stop") || tt.includes("diam") || tt.includes("berhenti") || tt.includes("cukup")) return "__STOP__";
  if(tt.includes("jam berapa") || tt.includes("pukul berapa")){
    const s = new Date(); return "Sekarang jam " + s.getHours() + ":" + s.getMinutes().toString().padStart(2,"0") + ", Bos.";
  }

  // Fungsi bantu - Baru jadi utama, lama jadi tambahan
  function jawabLaci(laci, kalimatAwal, kalimatKosong){
    let semua = (typeof ambilSemuaCatatan === 'function' ? ambilSemuaCatatan(laci) : []);
    if(semua.length === 0) return kalimatKosong;
    if(semua.length === 1) return kalimatAwal + " " + semua[0] + ".";
    let baru = semua[semua.length - 1];
    let lama = semua.slice(0, -1).join(", ");
    return "Terakhir Bos bilang " + kalimatAwal.toLowerCase() + " " + baru + ". Tapi sebelum itu, Bos pernah bilang " + lama + ".";
  }

  if(tt.includes("siapa nama saya") || tt.includes("nama saya siapa")){
    const v = (typeof ambilCatatan === 'function' ? ambilCatatan("nama") : null);
    return v ? "Nama Bos " + v + "." : "Saya belum tahu nama Bos. Nama Bos siapa?";
  }
  if(tt.includes("saya suka apa") || tt.includes("apa yang saya suka") || tt.includes("saya demen apa") || tt.includes("saya doyan apa")){
    return jawabLaci("suka", "Bos suka", "Bos belum pernah bilang Bos suka apa.");
  }
  if(tt.includes("hobi saya apa") || tt.includes("apa hobi saya")){
    return jawabLaci("hobi", "Hobi Bos", "Bos belum pernah bilang hobi Bos apa.");
  }
  if(tt.includes("saya tinggal di mana") || tt.includes("saya di mana") || tt.includes("rumah saya di mana")){
    return jawabLaci("kota", "Bos tinggal di", "Saya belum tahu Bos tinggal di mana.");
  }
  if(tt.includes("kerja saya apa") || tt.includes("saya kerja apa")){
    return jawabLaci("pekerjaan", "Bos kerja", "Bos belum pernah bilang Bos kerja apa.");
  }
  if(tt.includes("saya marah") || tt.includes("saya kesal")) return "Sabar ya, Bos. Tarik napas dulu. Cerita saja sama saya, kenapa Bos marah?";
  if(tt.includes("saya lapar")) return "Wah, Bos lapar ya? Makan dulu, Bos. Jangan tahan lapar.";
  if(tt.includes("mau tidur") || tt.includes("ngantuk")) return "Oke Bos, selamat istirahat ya. Jangan lupa minum air.";
  if(tt.includes("halo") || tt.includes("hai") || tt.includes("selamat pagi") || tt.includes("selamat malam") || tt.includes("assalamualaikum")) return "Halo Bos, ada yang bisa saya bantu?";
  if(tt.includes("apa kabar") || tt.includes("gimana kabar")) return "Kabar saya baik, Bos. Bos sendiri gimana?";
  if(tt.includes("terima kasih") || tt.includes("makasih") || tt.includes("thanks")) return "Sama-sama, Bos. Senang bisa bantu.";

  return null; // Tidak kenal -> lempar ke Otak Besar
}
window.pikirKecil = pikirKecil;
window.fikirKecil = pikirKecil;
window.OtakKecil = { fikirKecil: function(teks, cb){ const j = pikirKecil(teks); if(typeof cb === 'function' && j) cb(j); return j; } };
