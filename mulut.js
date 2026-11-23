// MULUT MAVIX V2.3 - VERSI LENGKAP
// Tugas file ini:
// 1. Bicara pakai suara dari server.js (EdgeTTS, suara perempuan Indonesia)
// 2. Kalau server gagal, pakai suara dari HP Bos sebagai cadangan
// 3. Kalau Bos bilang diam, berhenti langsung, tidak lanjut ngomong

window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;

let audioMavix = null;
let urlAudioLama = null;
let bicaraKe = 0;

// --- 1. BERSIHKAN AUDIO LAMA ---
// Supaya suara lama tidak numpuk dengan suara baru
function bersihkanAudioLama(){
  if(urlAudioLama){
    try{ URL.revokeObjectURL(urlAudioLama); }catch(e){}
    urlAudioLama = null;
  }
  if(audioMavix){
    try{
      audioMavix.pause();
      audioMavix.src = "";
      audioMavix.onended = null;
      audioMavix.onerror = null;
    }catch(e){}
  }
}

// --- 2. HENTIKAN BICARA ---
// Dipanggil kalau Bos bilang diam, atau kalau mau ganti kalimat baru
function hentikanBicara(){
  bicaraKe++;
  try{ window.speechSynthesis.cancel(); }catch(e){}
  bersihkanAudioLama();
  window.MAVIX.sedangNgomong = false;
  if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
  // Kasih tahu suara.html, supaya gelombang mulut berhenti
  document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
}

function stopMulut(){
  hentikanBicara();
}

// --- 3. BICARA - FUNGSI UTAMA ---
function bicara(teks){
  if(!teks) return;
  const teksBersih = teks.toString().trim();
  if(!teksBersih) return;

  // Hentikan suara lama dulu, baru mulai yang baru
  hentikanBicara();

  if(window.MAVIX.manajer) window.MAVIX.manajer.mulaiNgomong();
  window.MAVIX.sedangNgomong = true;

  // Kasih tahu suara.html, supaya gelombang mulut jalan
  document.dispatchEvent(new CustomEvent('mavix-mulai-ngomong'));

  const idBicaraIni = bicaraKe;
  cobaEdgeTTS(teksBersih, idBicaraIni);
}

// --- 4. COBA SUARA DARI SERVER (EDGETTS) ---
async function cobaEdgeTTS(teks, idBicaraIni){
  let sudahFallback = false;

  // Kalau server lama jawab lebih dari 4 detik, pakai suara HP saja
  // Supaya Bos tidak menunggu lama
  const timerFallback = setTimeout(() => {
    if(!sudahFallback && idBicaraIni === bicaraKe){
      sudahFallback = true;
      pakaiSuaraHP(teks, idBicaraIni);
    }
  }, 4000);

  try{
    const r = await fetch('/suara?teks=' + encodeURIComponent(teks.slice(0, 800)));

    // Kalau Bos sudah bilang diam / sudah ganti kalimat, berhenti
    if(idBicaraIni !== bicaraKe){ clearTimeout(timerFallback); return; }

    // Kalau server error, pakai suara HP
    if(!r.ok){
      clearTimeout(timerFallback);
      if(!sudahFallback){ sudahFallback = true; pakaiSuaraHP(teks, idBicaraIni); }
      return;
    }

    const blob = await r.blob();
    if(idBicaraIni !== bicaraKe){ clearTimeout(timerFallback); return; }

    // Kalau file suara kosong / terlalu kecil, pakai suara HP
    if(!blob || blob.size < 100){
      clearTimeout(timerFallback);
      if(!sudahFallback){ sudahFallback = true; pakaiSuaraHP(teks, idBicaraIni); }
      return;
    }

    clearTimeout(timerFallback);
    sudahFallback = true;
    bersihkanAudioLama();
    urlAudioLama = URL.createObjectURL(blob);

    if(!audioMavix){
      audioMavix = document.createElement('audio');
      audioMavix.id = 'audioMavix';
      audioMavix.style.display = 'none';
      audioMavix.preload = 'auto';
      document.body.appendChild(audioMavix);
    }

    audioMavix.src = urlAudioLama;

    audioMavix.onended = () => {
      bersihkanAudioLama();
      window.MAVIX.sedangNgomong = false;
      if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
      document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
    };

    audioMavix.onerror = () => {
      bersihkanAudioLama();
      pakaiSuaraHP(teks, idBicaraIni);
    };

    try{ await audioMavix.play(); }catch(e){ pakaiSuaraHP(teks, idBicaraIni); }

  }catch(e){
    clearTimeout(timerFallback);
    if(!sudahFallback && idBicaraIni === bicaraKe){
      sudahFallback = true;
      pakaiSuaraHP(teks, idBicaraIni);
    }
  }
}

// --- 5. CADANGAN: PAKAI SUARA HP BOS ---
// Kalau server gagal, pakai ini, supaya Mavix tetap bersuara
function pakaiSuaraHP(teks, idBicaraIni){
  if(idBicaraIni !== undefined && idBicaraIni !== bicaraKe) return;
  try{
    if(!window.speechSynthesis){ hentikanBicara(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = 'id-ID';
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    try{
      const suaraList = window.speechSynthesis.getVoices() || [];
      // Cari suara Indonesia dulu, kalau ada
      const suaraIndo = suaraList.find(v => (v.lang || "").toLowerCase().startsWith('id'));
      if(suaraIndo) u.voice = suaraIndo;
    }catch(e){}
    u.onend = () => {
      if(idBicaraIni !== undefined && idBicaraIni !== bicaraKe) return;
      window.MAVIX.sedangNgomong = false;
      if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
      document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
    };
    u.onerror = () => {
      if(idBicaraIni !== undefined && idBicaraIni !== bicaraKe) return;
      window.MAVIX.sedangNgomong = false;
      if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
      document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
    };
    window.speechSynthesis.speak(u);
  }catch(e){
    hentikanBicara();
  }
}

// Siapkan daftar suara HP
if(window.speechSynthesis){
  try{ window.speechSynthesis.onvoiceschanged = () => {}; }catch(e){}
}

window.bicara = bicara;
window.hentikanBicara = hentikanBicara;
window.stopMulut = stopMulut;
window.MAVIX.sedangNgomong = false;
