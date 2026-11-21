// otak-ingatan.js - OTAK INGATAN MAVIX
// Bos punya ingatan, simpan dalam phone Bos saja

let ingatanMAVIX = [];

try {
  let simpanLama = localStorage.getItem("mavix_ingatan");
  if (simpanLama) {
    ingatanMAVIX = JSON.parse(simpanLama);
  }
} catch (e) {
  ingatanMAVIX = [];
}

function simpanIngatan() {
  try {
    localStorage.setItem("mavix_ingatan", JSON.stringify(ingatanMAVIX));
  } catch (e) {}
}

function ingat(apa, siapa) {
  let baru = {
    apa: apa,
    siapa: siapa || "Bos",
    bila: new Date().toLocaleString("ms-MY")
  };
  ingatanMAVIX.push(baru);
  if (ingatanMAVIX.length > 100) {
    ingatanMAVIX = ingatanMAVIX.slice(-100);
  }
  simpanIngatan();
  return "Siap Bos, saya dah ingat: " + apa;
}

function apaYangSayaIngat() {
  if (ingatanMAVIX.length === 0) {
    return "Saya belum ingat apa-apa lagi Bos.";
  }
  return ingatanMAVIX.map((m, i) => (i+1) + ". " + m.apa + " - " + m.bila).join("\n");
}

function lupaSemua() {
  ingatanMAVIX = [];
  simpanIngatan();
  return "Siap Bos, saya dah lupa semua.";
}

window.ingat = ingat;
window.apaYangSayaIngat = apaYangSayaIngat;
window.lupaSemua = lupaSemua;
window.ingatanMAVIX = ingatanMAVIX;

console.log("otak-ingatan.js dah hidup! Saya boleh ingat dah Bos.");
