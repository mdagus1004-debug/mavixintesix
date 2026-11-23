// OTAK INGATAN MAVIX V2.3 - VERSI LENGKAP
// Tugas file ini:
// 1. Simpan chat Bos dan Mavix
// 2. Catat nama, suka, hobi, makanan, minuman, kota, pekerjaan, perasaan Bos
// 3. Buat catatan untuk Otak Besar (Groq)
// 4. Ambil chat terakhir untuk aturan lanjutkan

// --- 1. BERSIHKAN TEKS ---
// Buang kata yang tidak penting, supaya ingatan bersih
function bersihkanTeksIngatan(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  // Buang kata pengisi
  t = t.replace(/\b(banget|sangat|sekali|dong|ya|lho|kok|deh|sih|aja)\b/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

// --- 2. SIMPAN OBROLAN ---
// Simpan 50 chat terakhir di HP Bos, di localStorage
function simpanObrolan(siapa, teks){
  if(!teks) return;
  try{
    let arsip = JSON.parse(localStorage.getItem("mavix_arsip") || "[]");
    arsip.push({ siapa: siapa, teks: teks, waktu: Date.now() });
    // Kalau sudah lebih dari 50, buang yang paling lama, simpan 50 terakhir
    if(arsip.length > 50) arsip = arsip.slice(-50);
    localStorage.setItem("mavix_arsip", JSON.stringify(arsip));
  }catch(e){}
}

// --- 3. CATAT SATU LACI ---
// laci = nama, suka, hobi, makanan, minuman, kota, pekerjaan, perasaan
// isi = nilai yang mau dicatat
function catat(laci, isi){
  if(!isi) return "";
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    let lama = lemari[laci];
    // Kalau lama sudah list, tambah, simpan 3 terakhir
    if(Array.isArray(lama)){
      if(!lama.includes(isi)) lama.push(isi);
      lemari[laci] = lama.slice(-3);
    } else if(lama && lama !== isi){
      // Kalau lama satu nilai, dan baru beda, jadikan list 2 nilai
      lemari[laci] = [lama, isi].slice(-3);
    } else {
      // Kalau belum ada, simpan langsung
      lemari[laci] = isi;
    }
    // Lemari maksimal 20 laci, supaya tidak penuh
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

// --- 4. AMBIL CATATAN ---
// Ambil isi satu laci. Kalau list, gabung pakai koma.
function ambilCatatan(laci){
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    let v = lemari[laci];
    if(Array.isArray(v)) return v.join(", ");
    return v || "";
  }catch(e){ return ""; }
}

// --- 5. CATAT OTOMATIS DARI KALIMAT BOS ---
// Ini otak yang dengar kalimat Bos, lalu catat sendiri
function catatOtomatis(teks){
  if(!teks) return;
  let tFull = teks.toLowerCase();
  // Ambil kalimat pertama saja, sebelum tanda ?
  let bagian = tFull.split("?")[0];
  let t = bagian.trim().length > 3 ? bagian : tFull.replace(/\?/g, "");

  // Jangan catat kalau Bos sedang bertanya balik
  // Contoh: "siapa nama saya?" itu pertanyaan, bukan pernyataan
  if(t.startsWith("siapa") || t.startsWith("apa") || t.startsWith("mana") || t.startsWith("dimana") || t.startsWith("di mana") || t.startsWith("kapan")) return;
  if(t.includes("siapa nama saya") || t.includes("nama saya siapa") || t.includes("saya suka apa") || t.includes("saya di mana") || t.includes("saya tinggal di mana") || t.includes("kerja saya apa")) return;

  let m;

  // Nama: "nama saya adalah Budi" -> catat nama = budi
  m = t.match(/nama saya (?:adalah )?([^,?.]+)/);
  if(m) catat("nama", bersihkanTeksIngatan(m[1]));

  // Makanan favorit
  let sudahMakanMinum = false;
  m = t.match(/makanan favorit saya (?:adalah )?([^,?.]+)|makanan saya (?:adalah )?([^,?.]+)|saya suka makan ([^,?.]+)/);
  if(m){ catat("makanan", bersihkanTeksIngatan(m[1] || m[2] || m[3])); sudahMakanMinum = true; }

  // Minuman favorit
  m = t.match(/minuman favorit saya (?:adalah )?([^,?.]+)|minuman saya (?:adalah )?([^,?.]+)|saya suka minum ([^,?.]+)/);
  if(m){ catat("minuman", bersihkanTeksIngatan(m[1] || m[2] || m[3])); sudahMakanMinum = true; }

  // Suka umum, kalau bukan makanan / minuman
  // Contoh: "saya suka bola" -> catat suka = bola
  if(!sudahMakanMinum){
    m = t.match(/saya suka ([^,?.]+)/);
    if(m){
      const v = bersihkanTeksIngatan(m[1]);
      if(v && v !== "apa" && v !== "mana") catat("suka", v);
    }
  }

  // Hobi: "hobi saya adalah mancing"
  m = t.match(/hobi saya (?:adalah )?([^,?.]+)/);
  if(m) catat("hobi", bersihkanTeksIngatan(m[1]));

  // Kota: "saya tinggal di Johor Bahru" / "rumah saya di Johor Bahru"
  m = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/);
  if(m) catat("kota", bersihkanTeksIngatan(m[1] || m[2]));

  // Pekerjaan: "saya kerja sebagai supir" / "pekerjaan saya adalah guru"
  m = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/);
  if(m){
    const v = bersihkanTeksIngatan(m[1] || m[2]);
    if(v && v !== "apa") catat("pekerjaan", v);
  }

  // Perasaan: "saya sedih", "saya senang", "saya lelah"
  m = t.match(/saya (sedih|senang|marah|lelah|capek|lapar|ngantuk|kesal|bahagia|galau)/);
  if(m) catat("perasaan", m[1]);
}

// --- 6. BUAT CATATAN UNTUK OTAK BESAR ---
// Ini yang dikirim ke Groq lewat server.js V2.3
// Bentuknya teks rapi, mudah dibaca Groq
function buatCatatanUntukOtakBesar(){
  const nama = ambilCatatan("nama");
  const suka = ambilCatatan("suka");
  const hobi = ambilCatatan("hobi");
  const makanan = ambilCatatan("makanan");
  const minuman = ambilCatatan("minuman");
  const kota = ambilCatatan("kota");
  const pekerjaan = ambilCatatan("pekerjaan");
  const perasaan = ambilCatatan("perasaan");

  let s = "CATATAN TENTANG BOS:\n";
  if(nama) s += "- Nama: " + nama + "\n";
  if(suka) s += "- Suka: " + suka + "\n";
  if(hobi) s += "- Hobi: " + hobi + "\n";
  if(makanan) s += "- Makanan favorit: " + makanan + "\n";
  if(minuman) s += "- Minuman favorit: " + minuman + "\n";
  if(kota) s += "- Tinggal di: " + kota + "\n";
  if(pekerjaan) s += "- Pekerjaan: " + pekerjaan + "\n";
  if(perasaan) s += "- Perasaan terakhir: " + perasaan + "\n";

  // Kalau tidak ada catatan sama sekali, kirim kosong saja
  if(s === "CATATAN TENTANG BOS:\n") return "";
  return s;
}

// --- 7. AMBIL CHAT TERAKHIR ---
// Untuk aturan LANJUTKAN di server.js
// Kalau Bos bilang "lanjutkan", Groq baca chat terakhir ini, lalu sambung cerita
function ambilChatTerakhir(jumlah){
  try{
    const arsip = JSON.parse(localStorage.getItem("mavix_arsip") || "[]").slice(-(jumlah || 6));
    return arsip.map(a => (a.siapa === "user" ? "Bos: " : "Mavix: ") + a.teks).join("\n");
  }catch(e){ return ""; }
}

// --- 8. BUAT RINGKASAN ARSIP ---
// Nama lain dari ambilChatTerakhir, supaya otak-depan bisa panggil dua nama
function buatRingkasanArsip(){
  return ambilChatTerakhir(6);
}

// --- 9. HAPUS SEMUA INGATAN ---
// Kalau Bos mau mulai dari awal lagi
function hapusSemuaIngatan(){
  try{
    localStorage.removeItem("mavix_arsip");
    localStorage.removeItem("mavix_lemari");
  }catch(e){}
  return "Ingatan sudah dihapus Bos.";
}

// --- 10. DAFTARKAN KE WINDOW, SUPAYA FILE LAIN BISA PAKAI ---
window.simpanChat = simpanObrolan;
window.simpanObrolan = simpanObrolan;
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.ambilIngatan = ambilCatatan;
window.ingatOtomatis = catatOtomatis;
window.catatOtomatis = catatOtomatis;
window.buatCatatanUntukOtakBesar = buatCatatanUntukOtakBesar;
window.ambilChatTerakhir = ambilChatTerakhir;
window.buatRingkasanArsip = buatRingkasanArsip;
window.bersihkanTeksIngatan = bersihkanTeksIngatan;
window.hapusSemuaIngatan = hapusSemuaIngatan;
