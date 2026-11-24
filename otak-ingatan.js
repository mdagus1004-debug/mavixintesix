// OTAK INGATAN MAVIX V4.5 - BAHASA INDONESIA PENUH
// Prinsip: Muat sekali di awal ke memori, setelah itu baca dari memori, bukan dari database terus.
// Kamus: Memori + Database | Lemari: Database | Obrolan: Database + Indeks Terbalik

let basisData;
let kamusDiMemori = {}; // { kataDasar: [kataBaru] } - ini yang dipakai samakanKata
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
      // Kamus: kunci = kataBaru, 1 kata baru = 1 baris, tidak duplikat
      if(!basisData.objectStoreNames.contains("kamus")){
        basisData.createObjectStore("kamus", { keyPath: "kataBaru" });
      }
      // Lemari: kunci = laci
      if(!basisData.objectStoreNames.contains("lemari")){
        basisData.createObjectStore("lemari", { keyPath: "laci" });
      }
      // Benda: kunci = id, cuma 1 baris saja
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

// Pindahkan data lama dari penyimpanan lokal ke database, sekali saja
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

// ===== KAMUS - MUAT SEKALI KE MEMORI =====
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

// ===== LEMARI - DI DATABASE, BUKAN PENYIMPANAN LOKAL =====
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
async function ambilCatatan(laci){
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let permintaan = basisData.transaction("lemari", "readonly").objectStore("lemari").get(laci);
    permintaan.onsuccess = ()=> selesai(permintaan.result ? permintaan.result.isi[permintaan.result.isi.length-1] : null);
  });
}
async function ambilSemuaCatatan(laci){
  if(!basisData) await bukaDatabase();
  return new Promise(selesai=>{
    let permintaan = basisData.transaction("lemari", "readonly").objectStore("lemari").get(laci);
    permintaan.onsuccess = ()=> selesai(permintaan.result ? permintaan.result.isi : []);
  });
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
    let dasar = samakanKata(k);
    if(kataBaku.includes(dasar)) return true;
  }
  return false;
}

// ===== PERINTAH =====
async function bedahPerintah(teks){
  if(!teks) return null;
  let t = teks.toLowerCase().trim();
  let benda = daftarBenda.find(b => t.includes(b));
  if(!benda) return null;
  if(/\b(hapus|lupakan|buang)\b/.test(t) || t.includes("jangan ingat") || t.includes("jangan simpan")){
    return { perintah: "hapus", laci: benda, isi: null, teksAsli: teks };
  }
  if(/\b(ingatkan|ingetin|ingatkanlah)\b/.test(t)){
    let isi = t.split(benda).pop() || "";
    isi = isi.replace(/^(saya|aku|yang|adalah|itu|ada)\s+/g, "").trim();
    return { perintah: "ingatkan", laci: benda, isi: isi, teksAsli: teks };
  }
  if(/\b(ganti|ubah|rubah|tukar)\b/.test(t)){
    let cocok = t.match(/(?:jadi|menjadi|ke)\s+([^,?.]+)/);
    let isi = cocok ? bersihkanTeks(cocok[1]) : "";
    return { perintah: "ganti", laci: benda, isi: isi, teksAsli: teks };
  }
  if(/\b(tambah|tambahkan)\b/.test(t)){
    let isi = t.split(benda).pop() || "";
    isi = isi.replace(/^(saya|aku|adalah|yang)\s+/g, "").trim();
    return { perintah: "tambah", laci: benda, isi: bersihkanTeks(isi), teksAsli: teks };
  }
  if(/\b(cari|carikan|tampilkan|lihatkan)\b/.test(t)){
    return { perintah: "cari", laci: benda, isi: null, teksAsli: teks };
  }
  if(/\b(catat|catatkan|ingat|inget|simpan|save)\b/.test(t)){
    let isi = "";
    let cocok = t.match(new RegExp(benda + "\\s+(?:saya|aku)?\\s*(?:adalah)?\\s*([^,?.]+)"));
    if(cocok) isi = bersihkanTeks(cocok[1]);
    if(!isi){
      let sisa = t.split(benda).pop() || "";
      isi = bersihkanTeks(sisa.replace(/^(saya|aku|adalah|yang)\s+/g, ""));
    }
    if(!isi) return null;
    return { perintah: "catat", laci: benda, isi: isi, teksAsli: teks };
  }
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

// ===== OBROLAN - TAMBAH, TIDAK TIMPA =====
async function simpanObrolan(siapa, teks){
  if(!basisData) await bukaDatabase();
  if(!teks) return;
  let kata = bersihkanTeks(teks).split(/[^a-z0-9]+/).filter(Boolean).map(samakanKata);
  let data = { id: buatId(), siapa, teks, kata, waktu: Date.now() };
  await new Promise(selesai=>{
    let transaksi = basisData.transaction("obrolan", "readwrite");
    transaksi.objectStore("obrolan").add(data);
    transaksi.oncomplete = ()=> selesai(true);
  });
  if(siapa === "user" || siapa === "pengguna"){
    let hasil = await bedahPerintah(teks);
    if(hasil){
      let balasan = await jalankanPerintah(hasil);
      window.__balasanPerintah = balasan;
      return;
    }
    await catatOtomatis(teks);
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

async function catatOtomatis(teks){
  if(!teks) return;
  const t = teks.toLowerCase();
  if(await apakahPertanyaan(teks)) return;
  if(t.includes("siapa nama saya") || t.includes("saya suka apa") || t.includes("saya di mana")) return;
  let cocok;
  cocok = t.match(/nama saya (?:adalah )?([^,?.]+)/); if(cocok) await catat("nama", bersihkanTeks(cocok[1]));
  cocok = t.match(/saya suka ([^,?.]+)/); if(cocok){ let nilai = bersihkanTeks(cocok[1]); if(nilai && nilai!=="apa" && nilai!=="mana") await catat("suka", nilai); }
  cocok = t.match(/hobi saya (?:adalah )?([^,?.]+)/); if(cocok) await catat("hobi", bersihkanTeks(cocok[1]));
  cocok = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/); if(cocok) await catat("kota", bersihkanTeks(cocok[1]||cocok[2]));
  cocok = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/); if(cocok){ let nilai = bersihkanTeks(cocok[1]||cocok[2]); if(nilai && nilai!=="apa") await catat("pekerjaan", nilai); }
  cocok = t.match(/saya (sedih|senang|marah|lelah|capek|lapar|ngantuk|kesal|bahagia)/); if(cocok) await catat("perasaan", cocok[1]);
}

// ===== MULAI - CARA PAKAI DI AWAL =====
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
  tautan.download = "mavix-cadangan-v45.json";
  tautan.click();
}

// Biar bisa dipanggil dari file lain
window.bukaDatabase = bukaDatabase;
window.muatKamus = muatKamus;
window.muatBenda = muatBenda;
window.tambahBenda = tambahBenda;
window.samakanKata = samakanKata;
window.simpanKamus = simpanKamus;
window.isiKamusTanya = isiKamusTanya;
window.simpanObrolan = simpanObrolan;
window.simpanChat = simpanObrolan; // nama lama, biar file lama tetap jalan
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.ambilSemuaCatatan = ambilSemuaCatatan;
window.ingatOtomatis = catatOtomatis;
window.catatOtomatis = catatOtomatis;
window.cariKata = cariKata;
window.apakahPertanyaan = apakahPertanyaan;
window.isPertanyaan = apakahPertanyaan; // nama lama
window.bedahPerintah = bedahPerintah;
window.jalankanPerintah = jalankanPerintah;
window.mulaiMavix = mulaiMavix;
window.initMavix = mulaiMavix; // nama lama
window.eksporCadangan = eksporCadangan;
window.exportBackup = eksporCadangan; // nama lama
