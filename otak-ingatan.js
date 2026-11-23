// OTAK INGATAN MAVIX V3 - VERSI BETUL, TIDAK SIMPAN PERTANYAAN
function bersihkanTeksIngatan(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  t = t.replace(/\b(banget|sangat|sekali|dong|ya|lho|kok|deh)\b/g, "");
  t = t.replace(/\b(sebagai|jadi|adalah|itu)\b/g, "");
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
function ambilArsip(){ try{ return JSON.parse(localStorage.getItem("mavix_arsip") || "[]"); }catch(e){ return []; } }
function catat(laci, isi){
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    lemari[laci] = isi;
    localStorage.setItem("mavix_lemari", JSON.stringify(lemari));
  }catch(e){}
}
function ambilCatatan(laci){
  try{ let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}"); return lemari[laci] || null; }catch(e){ return null; }
}
function catatOtomatis(teks){
  if(!teks) return;
  const t = teks.toLowerCase();
  // JANGAN SIMPAN PERTANYAAN - ini yang dulu bikin ingat "mana" dan "apa"
  if(t.includes("?")) return;
  if(t.includes("siapa nama saya") || t.includes("nama saya siapa") || t.includes("saya suka apa") || t.includes("saya di mana") || t.includes("saya tinggal di mana") || t.includes("kerja saya apa") || t.includes("saya kerja apa")) return;
  let m;
  m = t.match(/nama saya (?:adalah )?([^,?.]+)/); if(m) catat("nama", bersihkanTeksIngatan(m[1]));
  m = t.match(/saya suka ([^,?.]+)/); if(m){
    // Jangan simpan kalau yang disuka itu "apa"
    const v = bersihkanTeksIngatan(m[1]);
    if(v && v !== "apa" && v !== "mana") catat("suka", v);
  }
  m = t.match(/hobi saya (?:adalah )?([^,?.]+)/); if(m) catat("hobi", bersihkanTeksIngatan(m[1]));
  m = t.match(/makanan favorit saya (?:adalah )?([^,?.]+)|makanan saya (?:adalah )?([^,?.]+)|saya suka makan ([^,?.]+)/); if(m) catat("makanan", bersihkanTeksIngatan(m[1]||m[2]||m[3]));
  m = t.match(/minuman favorit saya (?:adalah )?([^,?.]+)|minuman saya (?:adalah )?([^,?.]+)|saya suka minum ([^,?.]+)/); if(m) catat("minuman", bersihkanTeksIngatan(m[1]||m[2]||m[3]));
  m = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/); if(m) catat("kota", bersihkanTeksIngatan(m[1]||m[2]));
  m = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/); if(m){
    const v = bersihkanTeksIngatan(m[1]||m[2]);
    if(v && v !== "apa") catat("pekerjaan", v);
  }
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
function ambilChatTerakhir(jumlah){
  const arsip = ambilArsip().slice(-(jumlah || 4));
  return arsip.map(a => (a.siapa === "user" ? "Bos: " : "Mavix: ") + a.teks).join("\n");
}
function buatRingkasanArsip(){
  const arsip = ambilArsip();
  if(arsip.length === 0) return "";
  const terakhir = arsip.slice(-10).map(a => (a.siapa === "user" ? "Bos: " : "Mavix: ") + a.teks).join("\n");
  return "RINGKASAN ARSIP TERAKHIR:\n" + terakhir;
}
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
