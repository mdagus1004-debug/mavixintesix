// MULUT MAVIX - VERSI BERSIH + POTONG AYAT
let sedangBicara = false;
let modeSekarang = "NGOBROL";
let queueAyat = [];
let indexAyat = 0;

function bersihkanTeks(teks) {
  if (!teks) return "";
  return teks
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "$1")
    .replace(/\[.*?\]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[😀-🙏🏻💀-🫡]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function bicara(teks) {
  if (!teks) return;
  stopMulut();
  teks = bersihkanTeks(teks);
  if (!teks) return;

  if (!("speechSynthesis" in window)) return;

  // Potong jadi ayat pendek, max 180 huruf
  queueAyat = teks.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [teks];
  indexAyat = 0;
  if (typeof mavixNgomong === "function") mavixNgomong(true);
  sedangBicara = true;
  bacaAyatSeterusnya();
}

function bacaAyatSeterusnya() {
  if (indexAyat >= queueAyat.length) {
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
    return;
  }

  let ayat = queueAyat[indexAyat].trim();
  if (!ayat) { indexAyat++; bacaAyatSeterusnya(); return; }

  window.speechSynthesis.cancel();
  let ucap = new SpeechSynthesisUtterance(ayat);
  ucap.lang = "id-ID";
  ucap.rate = 1;
  ucap.pitch = 1.1;
  ucap.volume = 1;

  let semuaSuara = window.speechSynthesis.getVoices();
  let suaraGadis = semuaSuara.find(function(s){ return s.lang === "id-ID" && s.name.toLowerCase().includes("female"); }) ||
                    semuaSuara.find(function(s){ return s.lang === "id-ID"; }) ||
                    semuaSuara.find(function(s){ return s.lang.startsWith("id"); });
  if (suaraGadis) ucap.voice = suaraGadis;

  ucap.onend = function() {
    indexAyat++;
    setTimeout(bacaAyatSeterusnya, 150);
  };
  ucap.onerror = function() {
    indexAyat++;
    bacaAyatSeterusnya();
  };

  window.speechSynthesis.speak(ucap);
}

function stopMulut() {
  sedangBicara = false;
  queueAyat = [];
  indexAyat = 0;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}

function gantiMode(modeBaru) {
  modeSekarang = modeBaru;
  return modeSekarang;
}

window.bicara = bicara;
window.stopMulut = stopMulut;
window.gantiMode = gantiMode;

if ("speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = function(){ window.speechSynthesis.getVoices(); };
}
