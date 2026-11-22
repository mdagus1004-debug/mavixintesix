// OTAK INGATAN MAVIX V3.3 - LEMARI BERSIH, SUDAH BUANG DEPOSIT
// Lemari Besar = arsip, 100 chat, simpan semua, tidur di localStorage, TIDAK dikirim ke Groq
// Meja Kecil = riwayatChat4, 4 chat PENTING saja, yang dikirim ke Groq

let ingatanBos = {};
let riwayatChat4 = [];
let arsipChat = [];

// ===== KATA SAMPAH - TIDAK BOLEH NAIK MEJA KECIL =====
const KATA_SAMPAH = ["halo", "hai", "hi", "ok", "oke", "okay", "hmm", "hmmm", "siap", "ya", "yup", "sip", "terima kasih", "makasih", "thanks", "lanjut", "terus", "test", "tes"];

function isSampah(teks) {
  if (!teks) return true;
  let t = teks.toLowerCase().trim();
  if (t.length < 3) return true;
  if (KATA_SAMPAH.includes(t)) return true;
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
  let jawab = "Ini yang saya ingat Bos: ";
  if (nama) jawab += "Nama Bos " + nama + ". ";
  if (suka) jawab += "Bos suka " + suka + ". ";
  if (perasaan) jawab += "Terakhir Bos merasa " + perasaan + ". ";
  if (!nama && !suka && !perasaan) jawab = "Saya belum ingat apa-apa lagi Bos.";
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
  let catatan = "";
  if (nama) catatan += "Nama Bos: " + nama + "\n";
  if (suka) catatan += "Bos suka: " + suka + "\n";
  if (perasaan) catatan += "Perasaan terakhir Bos: " + perasaan + "\n";
  return catatan;
}

function buatRingkasanArsip() {
  try {
    let simpan = localStorage.getItem("arsip_mavix");
    if (simpan) arsipChat = JSON.parse(simpan);
  } catch(e){}
  if (!arsipChat || arsipChat.length <= 4) return "";
  let penting = arsipChat.filter(c => !isSampah(c.teks)).slice(-10);
  if (penting.length === 0) return "";
  let topik = penting.map(c => c.teks).join(" | ");
  if (topik.length > 200) topik = topik.slice(-200);
  return "RINGKASAN OBROLAN LAMA: " + topik;
}

function simpanChat(siapa, teks) {
  if (!teks) return;
  try {
    let simpanArsip = localStorage.getItem("arsip_mavix");
    if (simpanArsip) arsipChat = JSON.parse(simpanArsip);
  } catch(e){}
  arsipChat.push({ siapa: siapa, teks: teks });
  if (arsipChat.length > 100) arsipChat.shift();
  try { localStorage.setItem("arsip_mavix", JSON.stringify(arsipChat)); } catch(e){}

  if (isSampah(teks)) {
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
