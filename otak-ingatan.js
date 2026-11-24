// OTAK INGATAN MAVIX V4.6 - VERSI RAPI
// Perbaikan: 1x bersih, 1x cek perintah, 1x buka lemari

let basisData;
let kamusDiMemori = {};
let kamusSudahSiap = false;
let daftarBenda = ["nama", "hobi", "kota", "suka", "pekerjaan", "perasaan"];

function bukaDatabase(){
  return new Promise((selesai)=>{
    if(basisData){ selesai(basisData); return; }
    let permintaan = indexedDB.open("OtakKecilCS", 3);
    permintaan.onupgradeneeded = kejadian => {
      basisData = kejadian.target.result;
      if(!basisData.objectStoreNames.contains("obrolan")){
        let toko = basisData.createObjectStore("obrolan", { keyPath: "id" });
        toko.createIndex("berdasarkan_kata", "kata", { multiEntry: true });
      }
      if(!basisData.objectStoreNames.contains("kamus")){
        basisData.createObjectStore("kamus", { keyPath: "kataBaru" });
      }
      if(!basisData.objectStoreNames.contains("lemari")){
        basisData.createObjectStore("lemari", { keyPath: "laci" });
      }
      if(!basisData.objectStoreNames.contains("benda")){
        basisData.createObjectStore("benda", { keyPath: "id" });
      }
    };
    permintaan.onsuccess = async kejadian => {
      basisData = kejadian.target.result;
      await pindahkanDataLama();
      selesai(basisData);
    };
  });
}

async function pindahkanDataLama(){
  try{
    let bendaLama = JSON.parse(localStorage.getItem("mavix_benda") || "[]");
    if(bendaLama.length > 0){ daftarBenda = bendaLama; localStorage.removeItem("mavix_benda"); }
    let lemariLama = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    if(Object.keys(lemariLama).length > 0){
      let transaksi = basisData.transaction("lemari", "readwrite");
      for(let laci in lemariLama){
        let isi = Array.isArray(lemariLama[laci]) ? lemariLama[laci] : [lemariLama[laci]];
        transaksi.objectStore("lemari").put({ laci, isi });
      }
      await new Promise(selesai => transaksi.oncomplete = selesai);
      localStorage.removeItem("mavix_lemari");
    }
    let kamusLama = JSON.parse(localStorage.getItem("mavix_kamus") || "{}");
    if(Object.keys(kamusLama).length > 0){
      let transaksi2 = basisData.transaction("kamus", "readwrite");
      for(let dasar in kamusLama){
        for(let baru of kamusLama[dasar]) transaksi2.objectStore("kamus").put({ kataBaru: baru, kataDasar: dasar });
      }
      await new Promise(selesai => transaksi2.oncomplete = selesai);
      localStorage.removeItem("mavix_kamus");
    }
  }catch(galat){}
}

function buatId(){ return Date.now() + "-" + Math.random().toString(36).slice(2,7); }

function bersihkanTeks(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  t = t.replace(/\b(banget|sangat|sekali|dong|ya|lho|kok|deh)\b/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

// ===== KAMUS =====
async function muatKamus(){
  if(!basisData) await bukaDatabase();
  return new Promise((selesai)=>{
    let permintaan = basisData.transaction("kamus", "readonly").objectStore("kamus").getAll();
    permintaan.onsuccess = ()=>{
      kamusDiMemori = {};
      for(let baris of permintaan.result){
        if(!kamusDiMemori[baris.kataDasar]) kamusDiMemori[baris.kataDasar] = [];
        if(!kamusDiMemori[baris.kataDasar].includes(baris.kataBaru)) kamusDiMemori[baris.kataDasar].push(baris.kataBaru);
      }
      kamusSudahSiap = true;
      selesai(kamusDiMemori);
    };
  });
}

function samakanKata(kata){
  kata = kata.toLowerCase();
  if(kamusDiMemori[kata]) return kata;
  for(let dasar in kamusDiMemori){
    if(kamusDiMemori[dasar].includes(kata)) return dasar;
  }
  return kata;
}

async function simpanKamus(kataBaru, kataDasar){
  kataDasar = kataDasar.toLowerCase(); kataBaru = kataBaru.toLowerCase();
  if(kataBaru === kataDasar) return;
  if(!kamusDiMemori[kataDasar]) kamusDiMemori[kataDasar] = [];
  if(!kamusDiMemori[kataDasar].includes(kataBaru)) kamusDiMemori[kataDasar].push(kataBaru);
  if(!basisData) await bukaDatabase();
  return new Promise((selesai)=>{
    let transaksi = basisData.transaction("kamus", "readwrite");
    transaksi.objectStore("kamus").put({ kataBaru, kataDasar });
    transaksi.oncomplete = ()=> selesai(true);
  });
}

async function isiKamusTanya(){
  if(!kamusSudahSiap) await muatKamus();
  if(kamusDiMemori["mengapa"]) return;
  let daftar = [["kenapa","mengapa"],["knapa","mengapa"],["gimana","bagaimana"],["gmn","bagaimana"],["brapa","berapa"],["apaan","apa"],["apasih","apa"],["sapa","siapa"],["mana","dimana"],["dmana","dimana"]];
  for(let [baru, dasar] of daftar) await simpanKamus(baru, dasar);
}

// ===== BENDA =====
async function muatBenda(){
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let permintaan = basisData.transaction("benda", "readonly").objectStore("benda").get("daftar");
    permintaan.onsuccess = ()=>{
      if(permintaan.result) daftarBenda = permintaan.result.daftar;
      selesai(daftarBenda);
    };
  });
}
async function tambahBenda(bendaBaru){
  bendaBaru = bendaBaru.toLowerCase().trim();
  if(!bendaBaru || daftarBenda.includes(bendaBaru)) return daftarBenda;
  daftarBenda.push(bendaBaru);
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let transaksi = basisData.transaction("benda", "readwrite");
    transaksi.objectStore("benda").put({ id: "daftar", daftar: daftarBenda });
    transaksi.oncomplete = ()=> selesai(daftarBenda);
  });
}

// ===== LEMARI - PERBAIKAN: ambilCatatan pinjam ambilSemuaCatatan =====
async function catat(laci, isi){
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let toko = basisData.transaction("lemari", "readwrite").objectStore("lemari");
    let ambil = toko.get(laci);
    ambil.onsuccess = ()=>{
      let data = ambil.result || { laci, isi: [] };
      if(!data.isi.includes(isi)) data.isi.push(isi);
      toko.put(data);
      selesai(true);
    };
  });
}
async function hapusCatatan(laci){
  if(!basisData) await bukaDatabase();
  basisData.transaction("lemari", "readwrite").objectStore("lemari").delete(laci);
}
async function ambilSemuaCatatan(laci){
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let permintaan = basisData.transaction("lemari", "readonly").objectStore("lemari").get(laci);
    permintaan.onsuccess = ()=> selesai(permintaan.result ? permintaan.result.isi : []);
  });
}
async function ambilCatatan(laci){
  // Tidak buka lemari lagi, pinjam dari ambilSemuaCatatan
  let semua = await ambilSemuaCatatan(laci);
  return semua.length ? semua[semua.length - 1] : null;
}

// ===== PERTANYAAN =====
async function apakahPertanyaan(teks){
  if(!teks) return false;
  let t = teks.toLowerCase().trim();
  if(t.includes("?")) return true;
  t = t.replace(/di\s+mana/g, "dimana");
  let kataBaku = ["apa", "siapa", "dimana", "kapan", "mengapa", "bagaimana", "berapa"];
  let pecah = t.split(/[^a-z]+/).filter(Boolean);
  for(let k of pecah){
    if(kataBaku.includes(samakanKata(k))) return true;
  }
  return false;
}

// ===== PERINTAH + CATAT OTOMATIS - DIGABUNG JADI 1 CEK =====
// Fungsi: baca 1 kalimat, tentukan ini perintah / fakta / bukan apa-apa.
// Dipakai 1 kali saja dari simpanObrolan, jadi tidak dobel.
async function bedahPerintah(teks, teksBersih){
  if(!teks) return null;
  let t = (teksBersih || bersihkanTeks(teks)).toLowerCase().trim();
  let benda = daftarBenda.find(b => t.includes(b));
  if(!benda) return null;

  if(/\b(hapus|lupakan|buang)\b/.test(t) || t.includes("jangan ingat") || t.includes("jangan simpan")){
    return { perintah: "hapus", laci: benda, isi: null, teksAsli: teks };
  }
  if(/\b(ingatkan|ingetin)\b/.test(t)){
    let isi = t.split(benda).pop().replace(/^(saya|aku|yang|adalah|itu|ada)\s+/g, "").trim();
    return { perintah: "ingatkan", laci: benda, isi: isi, teksAsli: teks };
  }
  if(/\b(ganti|ubah|rubah|tukar)\b/.test(t)){
    let cocok = t.match(/(?:jadi|menjadi|ke)\s+([^,?.]+)/);
    return { perintah: "ganti", laci: benda, isi: cocok ? bersihkanTeks(cocok[1]) : "", teksAsli: teks };
  }
  if(/\b(tambah|tambahkan)\b/.test(t)){
    let isi = t.split(benda).pop().replace(/^(saya|aku|adalah|yang)\s+/g, "").trim();
    return { perintah: "tambah", laci: benda, isi: bersihkanTeks(isi), teksAsli: teks };
  }
  if(/\b(cari|carikan|tampilkan|lihatkan)\b/.test(t)){
    return { perintah: "cari", laci: benda, isi: null, teksAsli: teks };
  }
  if(/\b(catat|catatkan|ingat|inget|simpan|save)\b/.test(t)){
    let cocok = t.match(new RegExp(benda + "\\s+(?:saya|aku)?\\s*(?:adalah)?\\s*([^,?.]+)"));
    let isi = cocok ? bersihkanTeks(cocok[1]) : bersihkanTeks(t.split(benda).pop().replace(/^(saya|aku|adalah|yang)\s+/g, ""));
    if(!isi) return null;
    return { perintah: "catat", laci: benda, isi: isi, teksAsli: teks };
  }

  // Kalau bukan perintah, cek apakah ini fakta otomatis
  // Contoh: "nama saya Budi" tanpa kata "catat"
  if(await apakahPertanyaan(teks)) return null;
  let cocok;
  cocok = t.match(/nama saya (?:adalah )?([^,?.]+)/); if(cocok && benda==="nama") return { perintah: "catat", laci: "nama", isi: bersihkanTeks(cocok[1]), teksAsli: teks };
  cocok = t.match(/saya suka ([^,?.]+)/); if(cocok && benda==="suka"){ let v=bersihkanTeks(cocok[1]); if(v && v!=="apa" && v!=="mana") return { perintah: "catat", laci: "suka", isi: v, teksAsli: teks }; }
  cocok = t.match(/hobi saya (?:adalah )?([^,?.]+)/); if(cocok && benda==="hobi") return { perintah: "catat", laci: "hobi", isi: bersihkanTeks(cocok[1]), teksAsli: teks };
  cocok = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/); if(cocok && benda==="kota") return { perintah: "catat", laci: "kota", isi: bersihkanTeks(cocok[1]||cocok[2]), teksAsli: teks };
  cocok = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/); if(cocok && (benda==="pekerjaan")){ let v=bersihkanTeks(cocok[1]||cocok[2]); if(v && v!=="apa") return { perintah: "catat", laci: "pekerjaan", isi: v, teksAsli: teks }; }
  cocok = t.match(/saya (sedih|senang|marah|lelah|capek|lapar|ngantuk|kesal|bahagia)/); if(cocok && benda==="perasaan") return { perintah: "catat", laci: "perasaan", isi: cocok[1], teksAsli: teks };
  return null;
}

async function jalankanPerintah(hasil){
  if(!hasil) return null;
  if(hasil.perintah === "catat" || hasil.perintah === "tambah"){
    await catat(hasil.laci, hasil.isi);
    return "Siap Bos, sudah saya catat " + hasil.laci + " : " + hasil.isi;
  }
  if(hasil.perintah === "ganti"){
    await catat(hasil.laci, hasil.isi);
    return "Siap Bos, " + hasil.laci + " sudah saya ganti jadi " + hasil.isi;
  }
  if(hasil.perintah === "hapus"){
    await hapusCatatan(hasil.laci);
    return "Siap Bos, " + hasil.laci + " sudah saya hapus";
  }
  if(hasil.perintah === "cari"){
    let nilai = await ambilCatatan(hasil.laci);
    return nilai ? hasil.laci + " Bos: " + nilai : "Belum ada " + hasil.laci + " yang tercatat Bos";
  }
  if(hasil.perintah === "ingatkan"){
    await catat("pengingat_" + hasil.laci, hasil.isi);
    return "Siap Bos, nanti saya ingatkan: " + hasil.isi;
  }
  return null;
}

// ===== OBROLAN - PERBAIKAN: bersihkan 1x di depan =====
async function simpanObrolan(siapa, teks){
  if(!basisData) await bukaDatabase();
  if(!teks) return;
  let teksBersih = bersihkanTeks(teks); // cuma 1x di sini
  let kata = teksBersih.split(/[^a-z0-9]+/).filter(Boolean).map(samakanKata);
  let data = { id: buatId(), siapa, teks, kata, waktu: Date.now() };
  await new Promise(selesai=>{
    let transaksi = basisData.transaction("obrolan", "readwrite");
    transaksi.objectStore("obrolan").add(data);
    transaksi.oncomplete = ()=> selesai(true);
  });
  if(siapa === "user" || siapa === "pengguna"){
    let hasil = await bedahPerintah(teks, teksBersih); // 1x cek saja
    if(hasil){
      let balasan = await jalankanPerintah(hasil);
      window.__balasanPerintah = balasan;
      return;
    }
  }
}

async function cariKata(kataKunci){
  if(!basisData) await bukaDatabase();
  kataKunci = samakanKata(kataKunci.toLowerCase().trim());
  return new Promise(selesai=>{
    let transaksi = basisData.transaction("obrolan", "readonly");
    let permintaan = transaksi.objectStore("obrolan").index("berdasarkan_kata").getAll(kataKunci);
    permintaan.onsuccess = ()=> selesai(permintaan.result.sort((a,b)=> b.waktu - a.waktu));
  });
}

// Biar file lama tetap jalan, catatOtomatis sekarang panggil bedahPerintah
async function catatOtomatis(teks){
  let hasil = await bedahPerintah(teks);
  if(hasil) await jalankanPerintah(hasil);
}

// ===== MULAI =====
async function mulaiMavix(){
  await bukaDatabase();
  await muatKamus();
  await muatBenda();
  await isiKamusTanya();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

async function eksporCadangan(){
  if(!basisData) await bukaDatabase();
  let semuaKamus = await new Promise(selesai=>{
    let permintaan = basisData.transaction("kamus","readonly").objectStore("kamus").getAll();
    permintaan.onsuccess = ()=> selesai(permintaan.result);
  });
  let semuaLemari = await new Promise(selesai=>{
    let permintaan = basisData.transaction("lemari","readonly").objectStore("lemari").getAll();
    permintaan.onsuccess = ()=> selesai(permintaan.result);
  });
  let semuaObrolan = await new Promise(selesai=>{
    let permintaan = basisData.transaction("obrolan","readonly").objectStore("obrolan").getAll();
    permintaan.onsuccess = ()=> selesai(permintaan.result);
  });
  let blob = new Blob([JSON.stringify({kamus: semuaKamus, lemari: semuaLemari, obrolan: semuaObrolan, benda: daftarBenda}, null, 2)], {type:"application/json"});
  let tautan = document.createElement("a");
  tautan.href = URL.createObjectURL(blob);
  tautan.download = "mavix-cadangan-v46.json";
  tautan.click();
}

window.bukaDatabase = bukaDatabase;
window.muatKamus = muatKamus;
window.muatBenda = muatBenda;
window.tambahBenda = tambahBenda;
window.samakanKata = samakanKata;
window.simpanKamus = simpanKamus;
window.isiKamusTanya = isiKamusTanya;
window.simpanObrolan = simpanObrolan;
window.simpanChat = simpanObrolan;
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.ambilSemuaCatatan = ambilSemuaCatatan;
window.ingatOtomatis = catatOtomatis;
window.catatOtomatis = catatOtomatis;
window.cariKata = cariKata;
window.apakahPertanyaan = apakahPertanyaan;
window.isPertanyaan = apakahPertanyaan;
window.bedahPerintah = bedahPerintah;
window.jalankanPerintah = jalankanPerintah;
window.mulaiMavix = mulaiMavix;
window.initMavix = mulaiMavix;
window.eksporCadangan = eksporCadangan;
window.exportBackup = eksporCadangan;
