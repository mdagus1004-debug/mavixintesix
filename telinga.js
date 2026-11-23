// telinga.js - FINAL: Tekan badan V Mavix = Mic

let tombolMic = null;
let sedangMendengar = false;
let sedangNgomong = false;
let recognition = null;

// Pasang fungsi tekan ke badan V
function pasangTombolMic() {
  tombolMic = document.getElementById('tombolMic');

  // Tombol lama tetap ada tapi disembunyikan
  if (tombolMic && !tombolMic.dataset.sudahPasang) {
    tombolMic.dataset.sudahPasang = 'ya';
    tombolMic.addEventListener('click', tekanMic);
  }

  // Ini yang baru - Tekan badan V = tekan mic
  const badanMavix = document.getElementById('gambarMavix');
  if (badanMavix && !badanMavix.dataset.sudahPasang) {
    badanMavix.dataset.sudahPasang = 'ya';
    badanMavix.addEventListener('click', tekanMic);
  }
}

// Bila badan V ditekan
function tekanMic() {
  // Kalau Mavix tengah ngomong, potong dia
  if (sedangNgomong) {
    potongNgomong();
    return;
  }

  // Kalau dah tengah mendengar, jangan buat 2 kali
  if (sedangMendengar) return;

  mulaiDengar();
}

function mulaiDengar() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Browser ini tak support mic. Pakai Chrome ya Bos.');
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = function(event) {
      const teks = event.results[0][0].transcript;
      sedangMendengar = false;
      // Hantar ke otak
      if (typeof kirimKeOtak === 'function') {
        kirimKeOtak(teks);
      }
    };

    recognition.onend = function() {
      sedangMendengar = false;
    };

    recognition.onerror = function() {
      sedangMendengar = false;
    };
  }

  try {
    sedangMendengar = true;
    recognition.start();
  } catch (e) {
    sedangMendengar = false;
  }
}

// Dipanggil dari otak-depan.js bila Mavix mula ngomong
function setSedangNgomong(status) {
  sedangNgomong = status;
}

// Potong suara Mavix bila badan V ditekan lagi
function potongNgomong() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  sedangNgomong = false;
  sedangMendengar = false;
  // Lepas potong, terus dengar balik
  setTimeout(mulaiDengar, 200);
}

// Jalan bila page dibuka
document.addEventListener('DOMContentLoaded', pasangTombolMic);
