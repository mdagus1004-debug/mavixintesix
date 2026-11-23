// TELINGA MAVIX V2.3 - VERSI LENGKAP
// Tugas file ini:
// 1. Dengar suara Bos pakai mic HP
// 2. Ubah suara jadi teks
// 3. Kirim teks ke otak-depan.js
// 4. Kalau Mavix sedang ngomong, mic tidak boleh jalan

window.MAVIX = window.MAVIX || {};

let pengenalSuara = null;
let sedangDengar = false;
let micMauDihentikanPaksa = false;
let waktuMulaiDengar = 0;

// --- 1. CEK, APAKAH HP BOS BISA DENGAR SUARA? ---
function bisaDengar(){
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// --- 2. BUAT PENGENAL SUARA ---
function buatPengenal(){
  if(pengenalSuara) return pengenalSuara;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return null;

  const r = new SR();
  r.lang = 'id-ID'; // Dengar Bahasa Indonesia
  r.interimResults = false; // Hanya kirim hasil akhir, bukan hasil sementara
  r.continuous = false; // Berhenti setelah Bos selesai bicara, tidak jalan terus
  r.maxAlternatives = 1;

  // --- KETIKA HASIL SUARA DAPAT ---
  r.onresult = function(e){
    const hasil = e.results[0][0].transcript.trim();
    if(!hasil) return;
    // Tampilkan di kotak ketik, supaya Bos lihat apa yang didengar
    const inputEl = document.getElementById('input');
    if(inputEl) inputEl.value = hasil;
    // Kirim ke otak-depan
    if(window.kirim) window.kirim(hasil);
    // Kalau ada fungsi sesudah dengar, panggil
    if(window.setelahDengar) window.setelahDengar(hasil);
  };

  // --- KETIKA MIC SELESAI ---
  r.onend = function(){
    sedangDengar = false;
    if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiDengar();
    // Ubah tombol mic jadi tidak aktif lagi
    const btn = document.getElementById('micBtn');
    if(btn) btn.classList.remove('aktif');
    const status = document.getElementById('status');
    if(status && !window.MAVIX.sedangNgomong) status.innerText = "Siap Bos.";
    const status2 = document.getElementById('statusSuara');
    if(status2 && !window.MAVIX.sedangNgomong) status2.innerText = "Siap Bos.";
  };

  // --- KETIKA MIC ERROR ---
  r.onerror = function(e){
    sedangDengar = false;
    if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiDengar();
    const btn = document.getElementById('micBtn');
    if(btn) btn.classList.remove('aktif');
    const status = document.getElementById('status');
    // Kalau error karena Bos tidak bicara, jangan tampilkan error menakutkan
    if(e.error === 'no-speech' || e.error === 'aborted'){
      if(status) status.innerText = "Saya tidak dengar Bos, coba lagi ya.";
      return;
    }
    if(e.error === 'not-allowed' || e.error === 'service-not-allowed'){
      if(status) status.innerText = "Mic belum diizinkan Bos. Tekan izinkan di HP Bos ya.";
      return;
    }
    if(status) status.innerText = "Mic sedang sibuk Bos, coba tekan lagi.";
  };

  pengenalSuara = r;
  return r;
}

// --- 3. MULAI DENGAR ---
function mulaiDengar(){
  // Kalau Mavix sedang ngomong, jangan mulai dengar
  // Supaya suara Mavix tidak masuk lagi ke mic
  if(window.MAVIX.sedangNgomong) return;
  if(window.MAVIX.manajer && !window.MAVIX.manajer.mulaiDengar()) return;
  if(sedangDengar) return;
  if(!bisaDengar()){
    const status = document.getElementById('status');
    if(status) status.innerText = "HP Bos tidak bisa dengar suara. Ketik saja ya Bos.";
    return;
  }

  // Kalau Bos tekan mic lagi dalam 600 mili detik, anggap dobel, abaikan
  const sekarang = Date.now();
  if(sekarang - waktuMulaiDengar < 600) return;
  waktuMulaiDengar = sekarang;

  micMauDihentikanPaksa = false;

  try{
    const r = buatPengenal();
    if(!r) return;
    sedangDengar = true;
    const btn = document.getElementById('micBtn');
    if(btn) btn.classList.add('aktif');
    const status = document.getElementById('status');
    if(status) status.innerText = "Saya dengar Bos, silakan bicara...";
    const status2 = document.getElementById('statusSuara');
    if(status2) status2.innerText = "Saya dengar Bos, silakan bicara...";
    r.start();
  }catch(e){
    sedangDengar = false;
    if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiDengar();
  }
}

// --- 4. HENTIKAN DENGAR ---
// dipanggilPaksa = true, kalau dipanggil waktu Mavix mau ngomong
function hentikanDengar(dipanggilPaksa){
  micMauDihentikanPaksa = !!dipanggilPaksa;
  if(!pengenalSuara) return;
  try{ pengenalSuara.stop(); }catch(e){}
  sedangDengar = false;
  const btn = document.getElementById('micBtn');
  if(btn) btn.classList.remove('aktif');
}

// --- 5. GANTI MODE DENGAR / BERHENTI ---
// Kalau mic sedang jalan, tekan lagi untuk berhenti
// Kalau mic sedang berhenti, tekan untuk mulai
function gantiDengar(){
  if(sedangDengar){
    hentikanDengar(false);
  } else {
    mulaiDengar();
  }
}

// --- 6. PASANG TOMBOL MIC ---
function pasangMicBtn(){
  const b = document.getElementById('micBtn');
  if(b && !b.dataset.mavixPasang){
    b.dataset.mavixPasang = "1";
    b.addEventListener('click', () => gantiDengar());
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', pasangMicBtn);
} else {
  pasangMicBtn();
}

window.mulaiDengar = mulaiDengar;
window.hentikanDengar = hentikanDengar;
window.gantiDengar = gantiDengar;
window.bisaDengar = bisaDengar;
window.pasangMicBtn = pasangMicBtn;
