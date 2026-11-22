// OTAK INGATAN MAVIX V2.2 - LEMARI + 4 CHAT
let ingatanBos = {};
let riwayatChat4 = [];

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
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("ingatanBos_")) localStorage.removeItem(k);
    });
    localStorage.removeItem("chat4_mavix");
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

function simpanChat(siapa, teks) {
  riwayatChat4.push({ siapa: siapa, teks: teks });
  if (riwayatChat4.length > 4) riwayatChat4.shift();
  try { localStorage.setItem("chat4_mavix", JSON.stringify(riwayatChat4)); } catch(e){}
  // Biar Otak Kecil yang lama boleh baca juga
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
window.simpanChat = simpanChat;
window.ambilChatTerakhir = ambilChatTerakhir;
