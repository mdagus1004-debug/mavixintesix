// mulut.js - VERSI FINAL MUDAH
// Tugasnya cuma 2: ngomong dan berhenti

window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;

function bicara(teks, selesai) {
  if (!('speechSynthesis' in window)) return;
  if (!teks) { if (selesai) selesai(); return; }

  // Potong omongan lama kalau ada
  window.speechSynthesis.cancel();

  const ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = 'id-ID';
  ucap.rate = 1.0;
  ucap.pitch = 1.0;

  // Cari suara Indonesia
  const suaraList = window.speechSynthesis.getVoices();
  const suaraID = suaraList.find(s => s.lang && s.lang.toLowerCase().startsWith('id'));
  if (suaraID) ucap.voice = suaraID;

  ucap.onstart = () => {
    window.MAVIX.sedangNgomong = true;
    // Waktu ngomong, telinga tutup total
    if (window.MAVIX.recognition) {
      try { window.MAVIX.recognition.stop(); } catch(e) {}
    }
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

window.MAVIX.bicara = bicara;
window.MAVIX.hentikanBicara = hentikanBicara;
