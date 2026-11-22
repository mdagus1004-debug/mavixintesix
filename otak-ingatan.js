// OTAK INGATAN MAVIX V3 - LEMARI BESAR ARSIP + MEJA KECIL FILTER + RINGKASAN
// Lemari Besar = arsip, 100 chat, simpan semua, tidur di localStorage, TIDAK dikirim ke Groq
// Meja Kecil = riwayatChat4, 4 chat PENTING saja, yang dikirim ke Groq

let ingatanBos = {};
let riwayatChat4 = [];
let arsipChat = [];

// ===== KATA SAMPAH - TIDAK BOLEH NAIK MEJA KECIL =====
// Kalau Bos bilang ini, tetap masuk Arsip, tapi JANGAN masuk Meja Kecil
// Biar slot Meja Kecil tidak habis buat sampah
const KATA_SAMPAH = ["halo", "hai", "hi", "ok", "oke", "okay", "hmm", "hmmm", "siap", "ya", "yup", "sip", "terima kasih", "makasih", "thanks", "lanjut", "terus", "test", "tes"];

function isSampah(teks) {
  if (!teks) return true;
  let t = teks.toLowerCase().trim();
  // 1. Kalau terlalu pendek, sampah. Contoh: "ok", "ya", "hi"
  if (t.length < 3) return true;
  // 2. Kalau persis sama dengan kata sampah, sampah
  if (KATA_SAMPAH.includes(t)) return true;
  // 3. Kalau cuma "halo mavix", "oke bos", itu juga sampah
  if (t === "halo mavix" || t === "oke bos" || t === "siap bos") return true;
  return false;
}

function ingat(nilai, kunci) {
  ingatanBos[kunci] = nilai;
  try { localStorage.setItem("ingatanBos_" + kunci, nilai); } catch(e){}
}

function ambilIngatan(kunci) {
  if (ingatanBos[kunci]) return ingatanBos[kunci];
  try {
    let v = localStorage.getItem("ingatanBos_" + kunci);
    if (v) { ingatanBos[kunci] = v; return v; }
  } catch(e){}
  return "";
}

function ingatOtomatis(teks) {
  let t = teks.toLowerCase();
  if (t.includes("nama saya")) {
    let nama = teks.replace(/nama saya/i, "").replace(/adalah/i, "").trim();
    if (nama) ingat(nama, "nama");
  }
  if (t.includes("saya suka")) {
    let suka = teks.replace(/saya suka/i, "").trim();
    if (suka) ingat(suka, "suka");
  }
  if (t.includes("saya sedih") || t.includes("saya galau")) ingat("sedih", "perasaan");
  if (t.includes("saya senang")) ingat("senang", "perasaan");
  if (t.includes("saya capek")) ingat("capek", "perasaan");
}

function apaYangSayaIngat() {
  let nama = ambilIngatan("nama");
  let suka = ambilIngatan("suka");
  let perasaan = ambilIngatan("perasaan");
  let deposit = ambilIngatan("deposit");
  let jawab = "Ini yang saya ingat Bos: ";
  if (nama) jawab += "Nama Bos " + nama + ". ";
  if (suka) jawab += "Bos suka " + suka + ". ";
  if (perasaan) jawab += "Terakhir Bos merasa " + perasaan + ". ";
  if (deposit) jawab += "Deposit Bos " + deposit + ". ";
  if (!nama && !suka && !perasaan && !deposit) jawab = "Saya belum ingat apa-apa lagi Bos.";
  return jawab;
}

function lupaSemua() {
  ingatanBos = {};
  riwayatChat4 = [];
  arsipChat = [];
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("ingatanBos_")) localStorage.removeItem(k);
    });
    localStorage.removeItem("chat4_mavix");
    localStorage.removeItem("arsip_mavix");
  } catch(e){}
  return "Oke Bos, saya sudah lupa semua. Kita kenal lagi dari awal ya.";
}

function buatCatatanUntukOtakBesar() {
  let nama = ambilIngatan("nama");
  let suka = ambilIngatan("suka");
  let perasaan = ambilIngatan("perasaan");
  let deposit = ambilIngatan("deposit");
  let catatan = "";
  if (nama) catatan += "Nama Bos: " + nama + "\n";
  if (suka) catatan += "Bos suka: " + suka + "\n";
  if (perasaan) catatan += "Perasaan terakhir Bos: " + perasaan + "\n";
  if (deposit) catatan += "Deposit Bos: " + deposit + "\n";
  return catatan;
}

// ===== BARU V3 - BIKIN RINGKASAN 1 BARIS DARI ARSIP =====
// Ini yang dikirim ke Groq, bukan arsip mentah-mentah
// Token cuma ~30 token, bukan 2500 token
function buatRingkasanArsip() {
  try {
    let simpan = localStorage.getItem("arsip_mavix");
    if (simpan) arsipChat = JSON.parse(simpan);
  } catch(e){}
  if (!arsipChat || arsipChat.length <= 4) return ""; // Kalau arsip masih sedikit, tidak perlu ringkasan, meja kecil sudah cukup

  // Ambil 10 chat penting terakhir dari arsip, yang bukan sampah
  let penting = arsipChat.filter(c => !isSampah(c.teks)).slice(-10);
  if (penting.length === 0) return "";

  // Peras jadi 1 baris: ambil kata kunci saja
  let topik = penting.map(c => c.teks).join(" | ");
  // Potong biar tidak panjang, max 200 huruf saja
  if (topik.length > 200) topik = topik.slice(-200);
  return "RINGKASAN OBROLAN LAMA: " + topik;
}

// ===== BARU V3 - SIMPAN 2 TEMPAT, 1 FILTER =====
function simpanChat(siapa, teks) {
  if (!teks) return;

  // [1] LEMARI BESAR - Simpan SEMUA, tidak difilter, max 100
  // Ini arsip, tidur di localStorage, TIDAK dikirim ke Groq
  try {
    let simpanArsip = localStorage.getItem("arsip_mavix");
    if (simpanArsip) arsipChat = JSON.parse(simpanArsip);
  } catch(e){}
  arsipChat.push({ siapa: siapa, teks: teks });
  if (arsipChat.length > 100) arsipChat.shift(); // Kalau sudah 101, buang yang paling lama
  try { localStorage.setItem("arsip_mavix", JSON.stringify(arsipChat)); } catch(e){}

  // [2] MEJA KECIL - Simpan CUMA YANG PENTING, max 4
  // Ini yang dikirim ke Groq, jadi harus bersih dari sampah
  if (isSampah(teks)) {
    // Sampah: jangan naik meja, biar slot meja tidak habis
    // Tapi tetap update OtakKecil biar tidak error
    try { if (typeof OtakKecil !== 'undefined') OtakKecil.riwayatChat = riwayatChat4; } catch(e){}
    return;
  }
  riwayatChat4.push({ siapa: siapa, teks: teks });
  if (riwayatChat4.length > 4) riwayatChat4.shift();
  try { localStorage.setItem("chat4_mavix", JSON.stringify(riwayatChat4)); } catch(e){}
  try { if (typeof OtakKecil !== 'undefined') OtakKecil.riwayatChat = riwayatChat4; } catch(e){}
}

function ambilChatTerakhir(jumlah) {
  if (!jumlah) jumlah = 4;
  try {
    let simpan = localStorage.getItem("chat4_mavix");
    if (simpan) riwayatChat4 = JSON.parse(simpan);
  } catch(e){}
  let ambil = riwayatChat4.slice(-jumlah);
  let hasil = "";
  ambil.forEach(c => {
    let nama = c.siapa === "user" ? "Bos" : "MAVIX";
    hasil += nama + ": " + c.teks + "\n";
  });
  return hasil;
}

window.ingat = ingat;
window.ambilIngatan = ambilIngatan;
window.ingatOtomatis = ingatOtomatis;
window.apaYangSayaIngat = apaYangSayaIngat;
window.lupaSemua = lupaSemua;
window.buatCatatanUntukOtakBesar = buatCatatanUntukOtakBesar;
window.buatRingkasanArsip = buatRingkasanArsip;
window.simpanChat = simpanChat;
window.ambilChatTerakhir = ambilChatTerakhir;
