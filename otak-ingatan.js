// OTAK INGATAN - MAVIX V2.4 - LEMARI + OBROLAN + BEDAH PERINTAH
// Perbaikan: tambah pola aku, tambah perintahLemariViaChat
const DB_NAMA = "OtakKecilCS";
let db = null;
function bukaDB() {
  return new Promise((res, rej) => {
    if (db) { res(db); return; }
    const req = indexedDB.open(DB_NAMA, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains("lemari")) d.createObjectStore("lemari", { keyPath: "laci" });
      if (!d.objectStoreNames.contains("obrolan")) d.createObjectStore("obrolan", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => { db = req.result; res(db); };
    req.onerror = () => rej(req.error);
  });
}
async function simpanChat(teks, siapa) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("obrolan", "readwrite");
    tx.objectStore("obrolan").add({ teks, siapa, waktu: Date.now() });
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
      const list = req.result.filter(x => x.siapa === "user");
      res(list.length ? list[list.length - 1].teks : null);
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
async function ambilLimaTerakhir() {
  const semua = await ambilSemuaObrolan();
  return semua.slice(-5);
}
async function ambilCatatan(laci) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("lemari", "readonly");
    const req = tx.objectStore("lemari").get(laci);
    req.onsuccess = () => res(req.result && Array.isArray(req.result.isi) ? req.result.isi : []);
    req.onerror = () => res([]);
  });
}
async function simpanLaci(laci, isi) {
  if (!db) await bukaDB();
  return new Promise((res) => {
    const tx = db.transaction("lemari", "readwrite");
    tx.objectStore("lemari").put({ laci, isi });
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
  m = t.match(/nama saya (adalah )?(.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[2])]); return; }
  m = t.match(/namaku (.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[1])]); return; }
  m = t.match(/nama aku (.+)/);
  if (m) { await simpanLaci("nama", [bersihNilai(m[1])]); return; }
  m = t.match(/saya suka (.+)/);
  if (m) {
    let lama = await ambilCatatan("suka");
    const baru = bersihNilai(m[1]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("suka", lama); return;
  }
  m = t.match(/aku suka (.+)/);
  if (m) {
    let lama = await ambilCatatan("suka");
    const baru = bersihNilai(m[1]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("suka", lama); return;
  }
  m = t.match(/hobi saya (adalah )?(.+)/);
  if (m) {
    let lama = await ambilCatatan("hobi");
    const baru = bersihNilai(m[2]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("hobi", lama); return;
  }
  m = t.match(/hobiku (.+)/);
  if (m) {
    let lama = await ambilCatatan("hobi");
    const baru = bersihNilai(m[1]);
    if (baru && !lama.includes(baru)) lama.push(baru);
    await simpanLaci("hobi", lama); return;
  }
  m = t.match(/saya tinggal di (.+)/);
  if (m) { await simpanLaci("kota", [bersihNilai(m[1])]); return; }
  m = t.match(/aku tinggal di (.+)/);
  if (m) { await simpanLaci("kota", [bersihNilai(m[1])]); return; }
  m = t.match(/kerja saya (adalah )?(.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[2])]); return; }
  m = t.match(/pekerjaan saya (adalah )?(.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[2])]); return; }
  m = t.match(/saya kerja di (.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku kerja di (.+)/);
  if (m) { await simpanLaci("pekerjaan", [bersihNilai(m[1])]); return; }
  m = t.match(/saya sedang (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/saya merasa (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/saya lagi (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku lagi (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku sedang (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
  m = t.match(/aku merasa (.+)/);
  if (m) { await simpanLaci("perasaan", [bersihNilai(m[1])]); return; }
}
async function perintahLemariViaChat(teks) {
  const t = teks.toLowerCase().trim();
  let m = t.match(/ubah (.+) di (suka|hobi) jadi (.+)/);
  if (m) {
    let lama = await ambilCatatan(m[2]);
    lama = lama.map(x => x === bersihNilai(m[1]) ? bersihNilai(m[3]) : x);
    await simpanLaci(m[2], lama);
    return "Siap Bos, sudah diubah jadi " + bersihNilai(m[3]) + ".";
  }
  m = t.match(/hapus (.+) dari (suka|hobi)/);
  if (m) {
    let lama = await ambilCatatan(m[2]);
    lama = lama.filter(x => x !== bersihNilai(m[1]));
    await simpanLaci(m[2], lama);
    return "Siap Bos, " + bersihNilai(m[1]) + " sudah dihapus.";
  }
  m = t.match(/lupakan (.+)/);
  if (m) {
    for (let laci of ["suka","hobi","nama","kota","pekerjaan","perasaan"]) {
      let lama = await ambilCatatan(laci);
      lama = lama.filter(x => x !== bersihNilai(m[1]));
      await simpanLaci(laci, lama);
    }
    return "Siap Bos, sudah dilupakan.";
  }
  m = t.match(/tambah (.+) ke (suka|hobi)/);
  if (m) {
    let lama = await ambilCatatan(m[2]);
    const baru = bersihNilai(m[1]);
    if (!lama.includes(baru)) lama.push(baru);
    await simpanLaci(m[2], lama);
    return "Siap Bos, " + baru + " ditambah ke " + m[2] + ".";
  }
  return null;
}
window.perintahLemariViaChat = perintahLemariViaChat;
