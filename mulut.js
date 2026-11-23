// mulut.js - FINAL
window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;

function bicara(teks, selesai) {
  if (!('speechSynthesis' in window)) return;
  if (!teks) { if (selesai) selesai(); return; }
  window.speechSynthesis.cancel();
  const ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = 'id-ID';
  ucap.rate = 1.0;
  ucap.pitch = 1.0;
  const suaraList = window.speechSynthesis.getVoices();
  const suaraID = suaraList.find(s => s.lang && s.lang.toLowerCase().startsWith('id'));
  if (suaraID) ucap.voice = suaraID;
  ucap.onstart = () => {
    window.MAVIX.sedangNgomong = true;
    const el = document.getElementById('status');
    if (el) el.textContent = 'Mavix lagi ngomong...';
  };
  ucap.onend = () => {
    window.MAVIX.sedangNgomong = false;
    if (selesai) selesai();
  };
  ucap.onerror = () => {
    window.MAVIX.sedangNgomong = false;
    if (selesai) selesai();
  };
  window.speechSynthesis.speak(ucap);
}

function hentikanBicara() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  window.MAVIX.sedangNgomong = false;
}

window.bicara = bicara;
window.hentikanBicara = hentikanBicara;
window.MAVIX.bicara = bicara;
window.MAVIX.hentikanBicara = hentikanBicara;
