// telinga.js - FINAL: Opening beda, Lanjutan beda
window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;
window.MAVIX.sudahSapa = false; // TAMBAHAN: Untuk bedakan pertama dan lanjutan
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
      if (event.results[i].isFinal) teksFinal += event.results[i][0].transcript;
      else teksSementara += event.results[i][0].transcript;
    }
    if (teksSementara.trim()) setStatus('Dengar: ' + teksSementara.trim());
    if (teksFinal.trim()) {
      const kirim = teksFinal.trim();
      setStatus('Proses: ' + kirim);
      try { rec.stop(); } catch(e) {}
      if (typeof kirimPesanSuara === 'function') kirimPesanSuara(kirim);
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
  if (!window.MAVIX.recognition) window.MAVIX.recognition = buatRecognition();
  try {
    window.MAVIX.recognition.start();
    setStatus('Lagi dengerin Bos...');
  } catch(e) {}
}

function tekanMic() {
  if (lagiProsesTekan) return;
  lagiProsesTekan = true;
  setTimeout(() => { lagiProsesTekan = false; }, 800);
  if (!tombolMic) tombolMic = document.getElementById('tombolMic');

  // Lagi ngomong, Bos tekan = POTONG, LANGSUNG DIAM, TIDAK NGOMONG APA-APA
  if (window.MAVIX.sedangNgomong) {
    hentikanBicara();
    window.MAVIX.micNyala = true;
    window.MAVIX.sudahKirim = false;
    setStatus('Lagi dengerin Bos...');
    mulaiDengar();
    return;
  }

  // Lagi dengar, Bos tekan = MATI
  if (window.MAVIX.micNyala) {
    matikanMicOtomatis();
    hentikanBicara();
    return;
  }

  // Mic mati, Bos tekan = MULAI
  window.MAVIX.micNyala = true;
  window.MAVIX.sudahKirim = false;
  if (tombolMic) tombolMic.style.background = '#ff4444';

  // ===== INI YANG DIBETULKAN BOS =====
  // Kalau BELUM pernah sapa, ini opening pertama
  if (!window.MAVIX.sudahSapa) {
    window.MAVIX.sudahSapa = true;
    bicara('Ya, Mavix di sini. Mau cerita apa?', () => {
      mulaiDengar();
    });
  } else {
    // Kalau SUDAH pernah sapa, ini lanjutan, jangan sapa lagi
    // Langsung bilang "Mavix mendengarkan..."
    bicara('Mavix mendengarkan...', () => {
      mulaiDengar();
    });
  }
  // ===== SAMPAI SINI =====
}

window.tekanMic = tekanMic;
window.MAVIX.tekanMic = tekanMic;
window.MAVIX.matikanMicOtomatis = matikanMicOtomatis;

function pasangTombolMic() {
  tombolMic = document.getElementById('tombolMic');
  if (tombolMic && !tombolMic.dataset.sudahPasang) {
    tombolMic.dataset.sudahPasang = 'ya';
    tombolMic.addEventListener('click', tekanMic);
  }
}
pasangTombolMic();
document.addEventListener('DOMContentLoaded', pasangTombolMic);
