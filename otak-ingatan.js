// OTAK INGATAN V4 - HANYA BETULKAN YANG BOS PILIH
function bersihkanTeksIngatan(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  // No.17: JANGAN buang sebagai/jadi/adalah/itu di tengah nama.
  // Buang cuma kata penguat di hujung saja
  t = t.replace(/\b(banget|sangat|sekali|dong|ya|lho|kok|deh)\b/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}
function simpanObrolan(siapa, teks){
  try{
    let arsip = JSON.parse(localStorage.getItem("mavix_arsip") || "[]");
    arsip.push({ siapa, teks, waktu: Date.now() });
    if(arsip.length > 50) arsip = arsip.slice(-50);
    localStorage.setItem("mavix_arsip", JSON.stringify(arsip));
  }catch(e){}
}
// No.5: Semua pulang "" kalau kosong, jangan null / undefined campur
function catat(laci, isi){
  if(!isi) return "";
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    // No.6: Jangan timpa, gabung jadi list, max 3
    let lama = lemari[laci];
    if(Array.isArray(lama)){
      if(!lama.includes(isi)) lama.push(isi);
      lemari[laci] = lama.slice(-3);
    } else if(lama && lama !== isi){
      lemari[laci] = [lama, isi].slice(-3);
    } else {
      lemari[laci] = isi;
    }
    // No.7: Lemari pun ada had, jangan penuh
    let keys = Object.keys(lemari);
    if(keys.length > 20){
      let baru = {};
      keys.slice(-20).forEach(k => baru[k] = lemari[k]);
      lemari = baru;
    }
    localStorage.setItem("mavix_lemari", JSON.stringify(lemari));
  }catch(e){}
  return "";
}
function ambilCatatan(laci){
  try{ let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}"); let v = lemari[laci]; if(Array.isArray(v)) return v.join(", "); return v || ""; }catch(e){ return ""; }
}
function catatOtomatis(teks){
  if(!teks) return;
  // No.21: Jangan return kalau ada ?. Buang bahagian soalan saja, simpan bahagian pernyataan
  // "Nama saya Budi, siapa nama kamu?" -> simpan "Nama saya Budi"
  let tFull = teks.toLowerCase();
  let bahagian = tFull.split("?")[0]; // ambil sebelum ? pertama
  // Kalau bahagian sebelum ? ada pernyataan, pakai dia. Kalau tak ada, pakai semua tapi buang soalan
  let t = bahagian.trim().length > 3 ? bahagian : tFull.replace(/\?/g, "");
  // Kalau memang soalan tulen saja, jangan simpan
  if(t.startsWith("siapa") || t.startsWith("apa") || t.startsWith("mana") || t.startsWith("dimana") || t.startsWith("kapan")) return;
  if(t.includes("siapa nama saya") || t.includes("nama saya siapa") || t.includes("saya suka apa") || t.includes("saya di mana") || t.includes("saya tinggal di mana") || t.includes("kerja saya apa")) return;

  let m;
  m = t.match(/nama saya (?:adalah )?([^,?.]+)/); if(m) catat("nama", bersihkanTeksIngatan(m[1]));
  // No.18: Cek makan/minum DULU, baru suka. Supaya tak jadi 2
  let sudahMakanMinum = false;
  m = t.match(/makanan favorit saya (?:adalah )?([^,?.]+)|makanan saya (?:adalah )?([^,?.]+)|saya suka makan ([^,?.]+)/); if(m){ catat("makanan", bersihkanTeksIngatan(m[1]||m[2]||m[3])); sudahMakanMinum = true; }
  m = t.match(/minuman favorit saya (?:adalah )?([^,?.]+)|minuman saya (?:adalah )?([^,?.]+)|saya suka minum ([^,?.]+)/); if(m){ catat("minuman", bersihkanTeksIngatan(m[1]||m[2]||m[3])); sudahMakanMinum = true; }
  if(!sudahMakanMinum){
    m = t.match(/saya suka ([^,?.]+)/); if(m){ const v = bersihkanTeksIngatan(m[1]); if(v && v !== "apa" && v !== "mana") catat("suka", v); }
  }
  m = t.match(/hobi saya (?:adalah )?([^,?.]+)/); if(m) catat("hobi", bersihkanTeksIngatan(m[1]));
  m = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/); if(m) catat("kota", bersihkanTeksIngatan(m[1]||m[2]));
  m = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/); if(m){ const v = bersihkanTeksIngatan(m[1]||m[2]); if(v && v !== "apa") catat("pekerjaan", v); }
  m = t.match(/saya (sedih|senang|marah|lelah|capek|lapar|ngantuk|kesal|bahagia)/); if(m) catat("perasaan", m[1]);
}
function buatCatatanUntukOtakBesar(){
  const nama = ambilCatatan("nama"), suka = ambilCatatan("suka"), hobi = ambilCatatan("hobi"), makanan = ambilCatatan("makanan"), minuman = ambilCatatan("minuman"), kota = ambilCatatan("kota"), pekerjaan = ambilCatatan("pekerjaan"), perasaan = ambilCatatan("perasaan");
  let s = "CATATAN TENTANG BOS:\n";
  if(nama) s += "- Nama: " + nama + "\n";
  if(suka) s += "- Suka: " + suka + "\n";
  if(hobi) s += "- Hobi: " + hobi + "\n";
  if(makanan) s += "- Makanan favorit: " + makanan + "\n";
  if(minuman) s += "- Minuman favorit: " + minuman + "\n";
  if(kota) s += "- Tinggal di: " + kota + "\n";
  if(pekerjaan) s += "- Pekerjaan: " + pekerjaan + "\n";
  if(perasaan) s += "- Perasaan terakhir: " + perasaan + "\n";
  if(s === "CATATAN TENTANG BOS:\n") return "";
  return s;
}
// No.7: SATU saja sumber chat, jangan 4 + 10
function ambilChatTerakhir(jumlah){
  const arsip = JSON.parse(localStorage.getItem("mavix_arsip") || "[]").slice(-(jumlah || 6));
  return arsip.map(a => (a.siapa === "user" ? "Bos: " : "Mavix: ") + a.teks).join("\n");
}
function buatRingkasanArsip(){ return ambilChatTerakhir(6); }
// No.1: Nama sama dalam dan luar
window.simpanChat = simpanObrolan;
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.ambilIngatan = ambilCatatan;
window.ingatOtomatis = catatOtomatis;
window.catatOtomatis = catatOtomatis;
window.buatCatatanUntukOtakBesar = buatCatatanUntukOtakBesar;
window.ambilChatTerakhir = ambilChatTerakhir;
window.buatRingkasanArsip = buatRingkasanArsip;
window.bersihkanTeksIngatan = bersihkanTeksIngatan;
window.simpanObrolan = simpanObrolan;
