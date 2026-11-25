// =================================================
// OTAK INGATAN - GUDANG
// Tugas: Buka DB, Simpan Chat, Simpan Lemari, Bedah Perintah
// =================================================
const DB_NAMA = "OtakKecilCS";
let db = null;

function bukaDB() {
  return new Promise((res, rej) => {
    if (db) { res(db); return; }
    const req = indexedDB.open(DB_NAMA, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains("lemari")) {
        d.createObjectStore("lemari", { keyPath: "laci" });
      }
      if (!d.objectStoreNames.contains("obrolan")) {
        d.createObjectStore("obrolan", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => { db = req.result; res(db); };
    req.onerror = () => rej(req.error);
  });
}

async function simpanChat(teks, siapa) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("obrolan", "readwrite");
    tx.objectStore("obrolan").add({ teks: teks, siapa: siapa, waktu: Date.now() });
    tx.oncomplete = () => res(true);
    tx.onerror = () => res(false);
  });
}

async function ambilObrolanTerakhirUser() {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("obrolan", "readonly");
    const req = tx.objectStore("obrolan").getAll();
    req.onsuccess = () => {
      const list = req.result.filter((x) => x.siapa === "user");
      if (list.length) res(list[list.length - 1].teks);
      else res(null);
    };
    req.onerror = () => res(null);
  });
}

async function ambilSemuaObrolan() {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("obrolan", "readonly");
    const req = tx.objectStore("obrolan").getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => res([]);
  });
}

// BARU: Ambil 5 obrolan terakhir, biar Depan tidak perlu potong sendiri
async function ambilLimaTerakhir() {
  const semua = await ambilSemuaObrolan();
  return semua.slice(-5);
}

async function ambilCatatan(laci) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("lemari", "readonly");
    const req = tx.objectStore("lemari").get(laci);
    req.onsuccess = () => {
      if (req.result && Array.isArray(req.result.isi)) res(req.result.isi);
      else res([]);
    };
    req.onerror = () => res([]);
  });
}

async function simpanLaci(laci, isi) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("lemari", "readwrite");
    tx.objectStore("lemari").put({ laci: laci, isi: isi });
    tx.oncomplete = () => res(true);
    tx.onerror = () => res(false);
  });
}

function ubahJadiTeks(arr) {
  if (!arr || !arr.length) return null;
  return arr.join(", ");
}

function bersihNilai(v) {
  return v.trim().replace(/\?+$/g, "").replace(/\.+$/g, "").trim();
}

async function bedahPerintah(teks) {
  const t = teks.toLowerCase().trim();
  let m = null;

  // NAMA - TIMPA, bukan tambah
  m = t.match(/nama saya (adalah )?(.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[2])]); return; }
  m = t.match(/namaku (.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[1])]); return; }
  m = t.match(/nama saya (.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[1])]); return; }

  // SUKA - TAMBAH
  m = t.match(/saya suka (.+)/);
  if (m) {
    let lama = await ambilCatatan("suka");
    const baru = bersihNilai(m[1]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("suka", lama);
    return;
  }

  // HOBI - TAMBAH
  m = t.match(/hobi saya (adalah )?(.+)/);
  if (m) {
    let lama = await ambilCatatan("hobi");
    const baru = bersihNilai(m[2]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("hobi", lama);
    return;
  }
  m = t.match(/hobi saya (.+)/);
  if (m) {
    let lama = await ambilCatatan("hobi");
    const baru = bersihNilai(m[1]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("hobi", lama);
    return;
  }

  // KOTA - TIMPA
  m = t.match(/saya tinggal di (.+)/);
  if (m) { await simpanLaci("kota", [bersihNilai(m[1])]); return; }
  m = t.match(/tinggal saya di (.+)/);
  if (m) { await simpanLaci("kota", [bersihNilai(m[1])]); return; }

  // PEKERJAAN - TIMPA
  m = t.match(/kerja saya (adalah )?(.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[2])]); return; }
  m = t.match(/pekerjaan saya (adalah )?(.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[2])]); return; }

  // PERASAAN - TIMPA
  m = t.match(/saya sedang (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/saya merasa (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  // BARU: Biar "saya lagi sedih" dan "aku lagi capek" juga ke simpan
  m = t.match(/saya lagi (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku lagi (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku sedang (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku merasa (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
}
