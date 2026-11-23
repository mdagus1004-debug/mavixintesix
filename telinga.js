// telinga.js - FINAL: 1x Jawab Langsung Mati, Anti Double, Tanpa Omongan "Mendengarkan"
window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;

let tombolMic = null;
let lagiProsesTekan = false;

function setStatus(teks) {
  const el = document.getElementById('status');
  if (el) el.textContent = teks;
}

function matikanMicOtomatis() {
  window.MAVIX.micNyala = false;
  if (window.MAVIX.recognition) {
    try { window.MAVIX.recognition.stop(); } catch(e) {}
  }
  if (tombolMic) tombolMic.style.background = '#1e90ff';
  setStatus('Tekan mic untuk ngobrol lagi');
}

function buatRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { setStatus('Browser tidak dukung mic'); return null; }
  const rec = new SR();
  rec.lang = 'id-ID';
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (event) => {
    let teksFinal = '';
    let teksSementara = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        teksFinal += event.results[i][0].transcript;
      } else {
        teksSementara += event.results[i][0].transcript;
      }
    }
    if (teksSementara.trim()) {
      setStatus('Dengar: ' + teksSementara.trim());
    }
    if (teksFinal.trim()) {
      const kirim = teksFinal.trim();
      setStatus('Proses: ' + kirim);
      try { rec.stop(); } catch(e) {}
      if (typeof kirimPesanSuara === 'function') {
        kirimPesanSuara(kirim);
      }
    }
  };

  rec.onend = () => {
    if (window.MAVIX.micNyala && !window.MAVIX.sedangNgomong && !window.MAVIX.sudahKirim) {
      try { rec.start(); } catch(e) {}
    }
  };

  rec.onerror = (e) => {
    if (e.error === 'not-allowed') {
      setStatus('Mic ditolak, izinkan mic di browser Bos');
      window.MAVIX.micNyala = false;
    }
  };
  return rec;
}

function mulaiDengar() {
  window.MAVIX.sudahKirim = false;
  if (!window.MAVIX.recognition) {
    window.MAVIX.recognition = buatRecognition();
  }
  try {
    window.MAVIX.recognition.start();
    setStatus('Lagi dengerin Bos...');
  } catch(e) {}
}

function stopDengarSaja() {
  if (window.MAVIX.recognition) {
    try { window.MAVIX.recognition.stop(); } catch(e) {}
  }
}

// TAMBALAN 1 - BUNGKUS BIAR TIDAK CRASH KALAU mulut.js BELUM SIAP
function amanHentikanBicara() {
  if (typeof hentikanBicara === 'function') {
    try { hentikanBicara(); } catch(e) {}
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
function amanBicara(teks, cb) {
  if (typeof bicara === 'function') {
    try { bicara(teks, cb); return; } catch(e) {}
  }
  // Kalau bicara gagal, terus dengar saja, jangan diam
  if (cb) cb();
}

function tekanMic(e) {
  if (e) e.stopPropagation();
  if (lagiProsesTekan) return;
  lagiProsesTekan = true;
  setTimeout(() => { lagiProsesTekan = false; }, 800);
  if (!tombolMic) tombolMic = document.getElementById('tombolMic');

  // Lagi ngomong, Bos tekan = POTONG, LANGSUNG DIAM
  if (window.MAVIX.sedangNgomong) {
    amanHentikanBicara();
    window.MAVIX.micNyala = true;
    window.MAVIX.sudahKirim = false;
    setStatus('Lagi dengerin Bos...');
    mulaiDengar();
    return;
  }

  // Lagi dengar, Bos tekan = MATI
  if (window.MAVIX.micNyala) {
    matikanMicOtomatis();
    amanHentikanBicara();
    return;
  }

  // Mic mati, Bos tekan = SAPA, MULAI LAGI
  window.MAVIX.micNyala = true;
  window.MAVIX.sudahKirim = false;
  if (tombolMic) tombolMic.style.background = '#ff4444';
  amanBicara('Ya, Mavix di sini. Mau cerita apa?', () => {
    mulaiDengar();
  });
}

window.tekanMic = tekanMic;
window.MAVIX.tekanMic = tekanMic;
window.MAVIX.matikanMicOtomatis = matikanMicOtomatis;

// TAMBALAN 2 - PASANG DUA-DUA, BADAN V + TOMBOL MIC BAWAH
function pasangTombolMic() {
  tombolMic = document.getElementById('tombolMic');
  if (tombolMic && !tombolMic.dataset.sudahPasang) {
    tombolMic.dataset.sudahPasang = 'ya';
    tombolMic.addEventListener('click', tekanMic);
  }
  // INI YANG HILANG TADI - PASANG BADAN V JUGA
  const layar = document.getElementById('layar-suara');
  if (layar && !layar.dataset.sudahPasang) {
    layar.dataset.sudahPasang = 'ya';
    layar.addEventListener('click', tekanMic);
  }
}
pasangTombolMic();
document.addEventListener('DOMContentLoaded', pasangTombolMic);
