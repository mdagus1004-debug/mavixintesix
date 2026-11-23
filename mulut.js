// telinga.js - VERSI LANGSUNG, TANPA 0,5 DETIK
window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;

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
    let teksFinal = '';
    let teksSementara = '';

    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        teksFinal += event.results[i][0].transcript;
      } else {
        teksSementara += event.results[i][0].transcript;
      }
    }

    // Kalau masih ngomong, tampilkan saja, jangan kirim dulu
    if (teksSementara.trim()) {
      setStatus('Dengar: ' + teksSementara.trim());
    }

    // Kalau sudah final, LANGSUNG KIRIM, tidak tunggu 0,5 detik
    if (teksFinal.trim()) {
      const kirim = teksFinal.trim();
      setStatus('Proses: ' + kirim);
      if (typeof kirimPesanSuara === 'function') {
        kirimPesanSuara(kirim);
      } else {
        setStatus('ERROR: kirimPesanSuara tidak ketemu');
      }
    }
  };

  rec.onend = () => {
    if (window.MAVIX.micNyala && !window.MAVIX.sedangNgomong) {
      try { rec.start(); } catch(e) {}
    }
  };

  rec.onerror = (e) => {
    console.log('Mic error:', e.error);
    if (e.error === 'not-allowed') {
      setStatus('Mic ditolak, izinkan mic di browser Bos');
      window.MAVIX.micNyala = false;
    }
  };

  return rec;
}

function mulaiDengar() {
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

function tekanMic() {
  if (!tombolMic) tombolMic = document.getElementById('tombolMic');

  // Lagi ngomong, Bos tekan = POTONG
  if (window.MAVIX.sedangNgomong) {
    hentikanBicara();
    window.MAVIX.micNyala = true;
    bicara('Mavix mendengarkan...', () => {
      mulaiDengar();
    });
    return;
  }

  // Lagi dengar, Bos tekan = MATI
  if (window.MAVIX.micNyala) {
    window.MAVIX.micNyala = false;
    stopDengarSaja();
    hentikanBicara();
    setStatus('Mic mati');
    return;
  }

  // Mic mati, Bos tekan = SAPA
  window.MAVIX.micNyala = true;
  bicara('Ya, Mavix di sini. Mau cerita apa?', () => {
    mulaiDengar();
  });
}

window.MAVIX.tekanMic = tekanMic;

document.addEventListener('DOMContentLoaded', () => {
  tombolMic = document.getElementById('tombolMic');
  if (tombolMic) tombolMic.addEventListener('click', tekanMic);
});
