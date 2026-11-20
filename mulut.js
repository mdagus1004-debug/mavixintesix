// MULUT MAVIX - VERSI SUARA HP - Bahasa Indonesia
// Tak pakai WebSocket lagi, tak pakai Edge lagi
// 100% pakai suara HP, jadi tak akan failed lagi

let sedangBicara = false;
let modeSekarang = "NGOBROL";

function bicara(teks) {
  if (!teks) return;
  stopMulut();
  if (typeof mavixNgomong === "function") mavixNgomong(true);
  sedangBicara = true;

  if (!("speechSynthesis" in window)) {
    console.log("HP tak ada suara");
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
    return;
  }

  window.speechSynthesis.cancel();
  let ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = "id-ID";
  ucap.rate = 1;
  ucap.pitch = 1.1;
  ucap.volume = 1;

  // Cari suara perempuan Indonesia kalau ada
  let semuaSuara = window.speechSynthesis.getVoices();
  let suaraGadis = semuaSuara.find(function(s){ return s.lang === "id-ID" && s.name.toLowerCase().includes("female"); }) ||
                    semuaSuara.find(function(s){ return s.lang === "id-ID"; }) ||
                    semuaSuara.find(function(s){ return s.lang.startsWith("id"); });
  if (suaraGadis) ucap.voice = suaraGadis;

  ucap.onstart = function() {
    sedangBicara = true;
    if (typeof mavixNgomong === "function") mavixNgomong(true);
  };
  ucap.onend = function() {
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
  };
  ucap.onerror = function() {
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
  };

  window.speechSynthesis.speak(ucap);
}

function stopMulut() {
  sedangBicara = false;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}

function gantiMode(modeBaru) {
  modeSekarang = modeBaru;
  console.log("Mode sekarang: " + modeSekarang);
  return modeSekarang;
}

window.bicara = bicara;
window.stopMulut = stopMulut;
window.gantiMode = gantiMode;

// Panaskan suara HP awal-awal biar tak lambat
if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = function(){ window.speechSynthesis.getVoices(); };
}
