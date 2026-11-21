// OTAK INGATAN MAVIX V2 - LEMARI SATU-SATUNYA
// Tugasnya cuma: SIMPAN, CARI, HAPUS. Tidak boleh mikir.

let ingatanMAVIX = [];

try {
  let lama = localStorage.getItem("mavix_ingatan_v2");
  if (lama) ingatanMAVIX = JSON.parse(lama);
} catch(e) { ingatanMAVIX = []; }

function simpanIngatan() {
  try { localStorage.setItem("mavix_ingatan_v2", JSON.stringify(ingatanMAVIX)); } catch(e) {}
}

// SIMPAN - dipakai Otak Kecil
function ingat(apa, kategori, siapa) {
  if (!apa) return "";
  // Kalau sudah ada yang sama, jangan simpan dobel, update saja
  let ada = ingatanMAVIX.find(m => m.apa.toLowerCase() === apa.toLowerCase() && m.kategori === kategori);
  if (ada) {
    ada.bila = new Date().toLocaleString("id-ID");
    simpanIngatan();
    return "Sudah saya update Bos: " + apa;
  }
  ingatanMAVIX.push({
    apa: apa,
    kategori: kategori || "umum", // nama, suka, tidak_suka, perasaan, catatan, janji
    siapa: siapa || "Bos",
    bila: new Date().toLocaleString("id-ID")
  });
  if (ingatanMAVIX.length > 200) ingatanMAVIX = ingatanMAVIX.slice(-200);
  simpanIngatan();
  return "Siap Bos, saya sudah ingat: " + apa;
}

// CARI - dipakai Otak Kecil
function cariIngatan(kataKunci, kategori) {
  let k = kataKunci.toLowerCase();
  return ingatanMAVIX.filter(m => {
    let cocokKata = m.apa.toLowerCase().includes(k);
    let cocokKategori = !kategori || m.kategori === kategori;
    return cocokKata && cocokKategori;
  });
}

function ambilIngatan(kategori) {
  let hasil = ingatanMAVIX.filter(m => m.kategori === kategori);
  if (hasil.length === 0) return "";
  return hasil[hasil.length - 1].apa; // ambil yang paling baru
}

function apaYangSayaIngat() {
  if (ingatanMAVIX.length === 0) return "Saya belum ingat apa-apa lagi Bos.";
  return ingatanMAVIX.map((m, i) => (i+1) + ". [" + m.kategori + "] " + m.apa + " - " + m.bila).join("\n");
}

function lupaSemua() {
  ingatanMAVIX = [];
  simpanIngatan();
  return "Siap Bos, saya sudah lupa semua.";
}

function lupaKategori(kategori) {
  ingatanMAVIX = ingatanMAVIX.filter(m => m.kategori !== kategori);
  simpanIngatan();
  return "Siap Bos, ingatan soal " + kategori + " sudah saya hapus.";
}

window.ingat = ingat;
window.cariIngatan = cariIngatan;
window.ambilIngatan = ambilIngatan;
window.apaYangSayaIngat = apaYangSayaIngat;
window.lupaSemua = lupaSemua;
window.lupaKategori = lupaKategori;
window.ingatanMAVIX = ingatanMAVIX;

console.log("otak-ingatan V2 hidup! Lemari siap Bos.");
