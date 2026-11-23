// telinga.js - VERSI FINAL MUDAH
// Aturan: 0.5 detik, tombol mic potong omongan, sapa dulu

window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;

let teksTampung = '';
let timerDiam = null;
let tombolMic = null;

function setStatus(teks) {
  const el = document.getElementById('status');
  if (el) el.textContent = teks;
}

function buatRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { setStatus('Browser tidak dukung mic'); return null; }

  const rec = new SR();
  rec.lang = 'id-ID';
  rec.continuous = true;
  rec.interimResults = true;

  rec.onresult = (event) => {
    let teksBaru = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) teksBaru += event.results[i][0].transcript;
    }
    if (!teksBaru.trim()) return;

    teksTampung = teksBaru.trim();
    setStatus('Dengar: ' + teksTampung);

    // Bos diam 0.5 detik saja, langsung kirim
    clearTimeout(timerDiam);
    timerDiam = setTimeout(() => {
      const kirim = teksTampung;
      teksTampung = '';
      if (kirim && window.MAVIX.micNyala) {
        // Telinga tutup dulu sebelum jawab
        stopDengarSaja();
        if (typeof kirimPesanSuara === 'function') {
          kirimPesanSuara(kirim);
        }
      }
    }, 500); // <-- 0.5 detik, sesuai permintaan Bos
  };

  rec.onend = () => {
    // Kalau mic masih nyala tapi recognition mati sendiri, nyalakan lagi
    // Kecuali lagi ngomong
    if (window.MAVIX.micNyala && !window.MAVIX.sedangNgomong) {
      try { rec.start(); } catch(e) {}
    }
  };

  return rec;
}

function mulaiDengar() {
  if (!window.MAVIX.recognition) {
    window.MAVIX.recognition = buatRecognition();
  }
  teksTampung = '';
  try {
    window.MAVIX.recognition.start();
    setStatus('Lagi dengerin Bos...');
    if (tombolMic) tombolMic.textContent = '🎤';
  } catch(e) {}
}

function stopDengarSaja() {
  clearTimeout(timerDiam);
  if (window.MAVIX.recognition) {
    try { window.MAVIX.recognition.stop(); } catch(e) {}
  }
}

// INI TOMBOL UTAMANYA
function tekanMic() {
  if (!tombolMic) tombolMic = document.getElementById('tombolMic');
  const tombol = tombolMic;

  // KASUS 3: MAVIX lagi ngomong, Bos tekan mic = POTONG
  if (window.MAVIX.sedangNgomong) {
    hentikanBicara();
    window.MAVIX.micNyala = true;
    // MAVIX ngomong lagi: Mavix mendengarkan...
    bicara('Mavix mendengarkan...', () => {
      mulaiDengar();
    });
    return;
  }

  // KASUS 4: Lagi dengar, Bos tekan mic = MATIKAN MIC
  if (window.MAVIX.micNyala) {
    window.MAVIX.micNyala = false;
    stopDengarSaja();
    hentikanBicara();
    setStatus('Mic mati');
    if (tombol) tombol.style.background = '';
    return;
  }

  // KASUS 1: Mic mati, Bos tekan mic = SAPA DULU
  window.MAVIX.micNyala = true;
  if (tombol) tombol.style.background = '#ff4444';
  bicara('Ya, Mavix di sini. Mau cerita apa?', () => {
    mulaiDengar();
  });
}

window.MAVIX.tekanMic = tekanMic;

// Sambung ke tombol di suara.html
document.addEventListener('DOMContentLoaded', () => {
  tombolMic = document.getElementById('tombolMic');
  if (tombolMic) {
    tombolMic.addEventListener('click', tekanMic);
  }
});
