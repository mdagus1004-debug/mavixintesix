// MULUT MAVIX - EDGE MICROSOFT + CADANGAN SUARA HP
// Bahasa Indonesia saja
let audioSekarang = null;
let sedangBicara = false;

function bersihkanTeks(teks) {
  if (!teks) return "";
  return teks.replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ").trim();
}

async function bicara(teks) {
  stopMulut();
  teks = bersihkanTeks(teks);
  if (!teks) return;
  sedangBicara = true;
  if (typeof mavixNgomong === "function") mavixNgomong(true);
  try {
    // Coba Edge dulu
    let respon = await fetch("/suara?teks=" + encodeURIComponent(teks));
    if (!respon.ok) throw new Error("Edge gagal");
    let blob = await respon.blob();
    let url = URL.createObjectURL(blob);
    audioSekarang = new Audio(url);
    audioSekarang.onended = function() {
      sedangBicara = false;
      if (typeof mavixNgomong === "function") mavixNgomong(false);
    };
    audioSekarang.onerror = function() { bicaraHP(teks); };
    audioSekarang.play();
  } catch (e) {
    // Kalau Edge gagal, jatuh ke suara HP supaya tidak bisu
    console.log("Jatuh ke suara HP");
    bicaraHP(teks);
  }
}

function bicaraHP(teks) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  let ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = "id-ID";
  ucap.rate = 1;
  ucap.pitch = 1.1;
  ucap.onend = function() {
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
  };
  window.speechSynthesis.speak(ucap);
}

function stopMulut() {
  sedangBicara = false;
  if (audioSekarang) { audioSekarang.pause(); audioSekarang = null; }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}

window.bicara = bicara;
window.stopMulut = stopMulut;

// Biar otak.js boleh baca status bicara
Object.defineProperty(window, 'sedangBicara', {
  get: function(){ return sedangBicara; },
  set: function(v){ sedangBicara = v; }
});
