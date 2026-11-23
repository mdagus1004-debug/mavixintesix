// MULUT MAVIX V2.4 - SUDAH DIPERBAIKI, TIDAK SPAM /suara LAGI
window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;
let audioMavix = null;
let urlAudioLama = null;
let bicaraKe = 0;
let antrianKalimat = [];
let sedangMainAntrian = false;

function bersihkanAudioLama(){
  if(urlAudioLama){ try{ URL.revokeObjectURL(urlAudioLama); }catch(e){} urlAudioLama = null; }
  if(audioMavix){ try{ audioMavix.pause(); audioMavix.src = ""; audioMavix.onended = null; audioMavix.onerror = null; }catch(e){} }
}

function hentikanBicara(){
  bicaraKe++;
  antrianKalimat = [];
  sedangMainAntrian = false;
  try{ window.speechSynthesis.cancel(); }catch(e){}
  bersihkanAudioLama();
  window.MAVIX.sedangNgomong = false;
  if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
  document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
}
function stopMulut(){ hentikanBicara(); }

// Potong jawaban panjang jadi kalimat pendek, supaya server tidak berat
function potongKalimat(teks){
  const potong = teks.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [teks];
  const hasil = [];
  potong.forEach(k => {
    let s = k.trim();
    while(s.length > 350){
      hasil.push(s.slice(0, 350));
      s = s.slice(350);
    }
    if(s) hasil.push(s);
  });
  return hasil.slice(0, 12); // Max 12 kalimat, supaya tidak spam
}

function bicara(teks){
  if(!teks) return;
  const teksBersih = teks.toString().trim();
  if(!teksBersih) return;
  hentikanBicara();
  if(window.MAVIX.manajer) window.MAVIX.manajer.mulaiNgomong();
  window.MAVIX.sedangNgomong = true;
  document.dispatchEvent(new CustomEvent('mavix-mulai-ngomong'));
  antrianKalimat = potongKalimat(teksBersih);
  sedangMainAntrian = true;
  mainKalimatBerikutnya(bicaraKe);
}

async function mainKalimatBerikutnya(idBicaraIni){
  if(idBicaraIni !== bicaraKe) return;
  if(antrianKalimat.length === 0){
    sedangMainAntrian = false;
    window.MAVIX.sedangNgomong = false;
    if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
    document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
    return;
  }
  const kalimat = antrianKalimat.shift();
  const ok = await cobaSatuKalimat(kalimat, idBicaraIni);
  if(!ok && idBicaraIni === bicaraKe){
    // Kalau server gagal, pakai suara HP untuk sisa kalimat, 1 kali saja
    pakaiSuaraHPUntukSisa(kalimat, idBicaraIni);
    return;
  }
  if(idBicaraIni === bicaraKe) mainKalimatBerikutnya(idBicaraIni);
}

async function cobaSatuKalimat(kalimat, idBicaraIni){
  try{
    const r = await fetch('/suara?teks=' + encodeURIComponent(kalimat));
    if(idBicaraIni !== bicaraKe) return true;
    if(!r.ok) return false;
    const blob = await r.blob();
    if(!blob || blob.size < 500) return false;
    bersihkanAudioLama();
    urlAudioLama = URL.createObjectURL(blob);
    if(!audioMavix){
      audioMavix = document.createElement('audio');
      audioMavix.id = 'audioMavix';
      audioMavix.style.display = 'none';
      document.body.appendChild(audioMavix);
    }
    audioMavix.src = urlAudioLama;
    await new Promise((selesai) => {
      audioMavix.onended = () => { bersihkanAudioLama(); selesai(); };
      audioMavix.onerror = () => { bersihkanAudioLama(); selesai(); };
      audioMavix.play().catch(() => selesai());
      // Kalau 8 detik tidak selesai, paksa lanjut ke kalimat berikut
      setTimeout(() => { try{ audioMavix.pause(); }catch(e){} selesai(); }, 8000);
    });
    return true;
  }catch(e){ return false; }
}

// Suara HP untuk sisa kalimat, supaya tidak diam
function pakaiSuaraHPUntukSisa(kalimatPertama, idBicaraIni){
  if(idBicaraIni !== bicaraKe) return;
  const sisa = [kalimatPertama, ...antrianKalimat].join(' ');
  antrianKalimat = [];
  try{
    if(!window.speechSynthesis){ hentikanBicara(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(sisa);
    u.lang = 'id-ID'; u.rate = 1; u.pitch = 1; u.volume = 1;
    try{
      const list = window.speechSynthesis.getVoices() || [];
      const indo = list.find(v => (v.lang || "").toLowerCase().startsWith('id'));
      if(indo) u.voice = indo;
    }catch(e){}
    u.onend = () => { if(idBicaraIni !== bicaraKe) return; sedangMainAntrian = false; window.MAVIX.sedangNgomong = false; if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong(); document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong')); };
    u.onerror = () => { if(idBicaraIni !== bicaraKe) return; sedangMainAntrian = false; window.MAVIX.sedangNgomong = false; if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong(); document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong')); };
    window.speechSynthesis.speak(u);
  }catch(e){ hentikanBicara(); }
}

if(window.speechSynthesis){ try{ window.speechSynthesis.onvoiceschanged = () => {}; }catch(e){} }
window.bicara = bicara;
window.hentikanBicara = hentikanBicara;
window.stopMulut = stopMulut;
window.MAVIX.sedangNgomong = false;
