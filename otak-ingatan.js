// OTAK INGATAN MAVIX V4 - GABUNGAN
// Aturan: 2 mesin saja - IndexedDB untuk simpan, Inverted Index untuk cari
// Aturan: ID anti timpa, simpan pakai ADD, ingatan cuma nambah, tidak ubah
// Aturan: Baru jadi utama, lama jadi tambahan

let db;
let kamus = JSON.parse(localStorage.getItem("mavix_kamus") || "{}");
// Contoh kamus awal: {"suka": ["doyan","demen"], "jalan-jalan": ["nongkrong"]}

function bukaDB(){
  return new Promise((res)=>{
    let req = indexedDB.open("OtakKecilCS", 1);
    req.onupgradeneeded = e => {
      db = e.target.result;
      let store = db.createObjectStore("chats", { keyPath: "id" });
      // Ini Inverted Index-nya
      store.createIndex("by_kata", "kata", { multiEntry: true });
    };
    req.onsuccess = e => { db = e.target.result; res(db); };
  });
}

function buatID(){
  return Date.now() + "-" + Math.random().toString(36).slice(2,7);
}

function bersihkanTeks(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  t = t.replace(/\b(banget|sangat|sekali|dong|ya|lho|kok|deh)\b/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

// KAMUS: samakan kata baru ke kata dasar
function samakanKata(kata){
  kata = kata.toLowerCase();
  if(kamus[kata]) return kata;
  for(let dasar in kamus){
    if(kamus[dasar].includes(kata)) return dasar;
  }
  return kata;
}

function simpanKamus(kataBaru, kataDasar){
  kataDasar = kataDasar.toLowerCase(); kataBaru = kataBaru.toLowerCase();
  if(!kamus[kataDasar]) kamus[kataDasar] = [];
  if(!kamus[kataDasar].includes(kataBaru)) kamus[kataDasar].push(kataBaru);
  localStorage.setItem("mavix_kamus", JSON.stringify(kamus));
}

// SIMPAN - Pakai ADD, bukan PUT, supaya tidak timpa
async function simpanObrolan(siapa, teks){
  if(!db) await bukaDB();
  if(!teks) return;
  // Jangan simpan pertanyaan yang menanyakan ingatan
  let t = teks.toLowerCase();
  if(t.includes("?") && (t.includes("saya suka apa") || t.includes("nama saya") || t.includes("saya di mana") || t.includes("kerja saya"))) return;

  let kata = bersihkanTeks(teks).split(/[^a-z0-9]+/).filter(Boolean).map(samakanKata);
  let data = { id: buatID(), siapa, teks, kata, waktu: Date.now() };
  let tx = db.transaction("chats", "readwrite");
  tx.objectStore("chats").add(data); // ADD = anti timpa

  // Tetap simpan ke laci lama supaya Satpam lama tetap jalan
  catatOtomatis(teks);
}

// CARI - Tanya ke Inverted Index, ambil kalimat utuh
async function cariKata(kataKunci){
  if(!db) await bukaDB();
  kataKunci = samakanKata(kataKunci.toLowerCase().trim());
  return new Promise(r=>{
    let tx = db.transaction("chats", "readonly");
    let req = tx.objectStore("chats").index("by_kata").getAll(kataKunci);
    req.onsuccess = ()=> r(req.result.sort((a,b)=> b.waktu - a.waktu)); // Baru paling atas
  });
}

// LACI LAMA - Biar file lama Bos tetap jalan, tidak dibuang
function catat(laci, isi){
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    // Simpan sebagai list, bukan 1 saja, supaya tidak timpa
    if(!lemari[laci]) lemari[laci] = [];
    if(!lemari[laci].includes(isi)) lemari[laci].push(isi);
    localStorage.setItem("mavix_lemari", JSON.stringify(lemari));
  }catch(e){}
}
function ambilCatatan(laci){
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    let v = lemari[laci];
    if(Array.isArray(v)) return v[v.length-1]; // Ambil yang terbaru
    return v || null;
  }catch(e){ return null; }
}
function ambilSemuaCatatan(laci){
  try{
    let lemari = JSON.parse(localStorage.getItem("mavix_lemari") || "{}");
    let v = lemari[laci];
    return Array.isArray(v) ? v : (v ? [v] : []);
  }catch(e){ return []; }
}
function catatOtomatis(teks){
  if(!teks) return;
  const t = teks.toLowerCase();
  if(t.includes("?")) return;
  if(t.includes("siapa nama saya") || t.includes("saya suka apa") || t.includes("saya di mana")) return;
  let m;
  m = t.match(/nama saya (?:adalah )?([^,?.]+)/); if(m) catat("nama", bersihkanTeks(m[1]));
  m = t.match(/saya suka ([^,?.]+)/); if(m){ let v = bersihkanTeks(m[1]); if(v && v!=="apa" && v!=="mana") catat("suka", v); }
  m = t.match(/hobi saya (?:adalah )?([^,?.]+)/); if(m) catat("hobi", bersihkanTeks(m[1]));
  m = t.match(/saya tinggal di ([^,?.]+)|rumah saya di ([^,?.]+)/); if(m) catat("kota", bersihkanTeks(m[1]||m[2]));
  m = t.match(/saya kerja (?:sebagai )?([^,?.]+)|pekerjaan saya (?:adalah )?([^,?.]+)/); if(m){ let v = bersihkanTeks(m[1]||m[2]); if(v && v!=="apa") catat("pekerjaan", v); }
  m = t.match(/saya (sedih|senang|marah|lelah|capek|lapar|ngantuk|kesal|bahagia)/); if(m) catat("perasaan", m[1]);
}

window.simpanChat = simpanObrolan;
window.catat = catat;
window.ambilCatatan = ambilCatatan;
window.ambilSemuaCatatan = ambilSemuaCatatan;
window.ingatOtomatis = catatOtomatis;
window.cariKata = cariKata;
window.samakanKata = samakanKata;
window.simpanKamus = simpanKamus;
window.bukaDB = bukaDB;
