window.MAVIX = window.MAVIX || {};
let rec = null;
let micNyala = false;
let sudahPasangTelinga = false;
function hentikanDengar(sementara){
  try{ if(rec) rec.stop(); }catch(e){}
  micNyala = false;
  if(window.MAVIX.manajer && !sementara) window.MAVIX.manajer.selesaiDengar();
}
function mulaDengar(){
  if(window.MAVIX.manajer && !window.MAVIX.manajer.mulaiDengar()) return;
  if(window.MAVIX.sedangNgomong) return;
  if(micNyala) return;
  try{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){
      if(window.MAVIX.manajer) window.MAVIX.manajer.setStatus("Mic tak sokong di HP ni Bos, taip saja ya.");
      if(window.tunjukTeksDarurat) window.tunjukTeksDarurat("Mic tak sokong Bos, taip saja ya.");
      return;
    }
    if(!rec){
      rec = new SR(); rec.lang='id-ID'; rec.interimResults=false; rec.continuous=false;
      rec.onresult = (e) => { const hasil = e.results[0][0].transcript; hentikanDengar(); if(window.kirim) window.kirim(hasil); };
      rec.onend = () => { micNyala = false; if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiDengar(); };
      rec.onerror = (e) => { micNyala = false; if(window.MAVIX.manajer) window.MAVIX.manajer.setStatus("Mic error Bos: " + e.error); if(window.tunjukTeksDarurat) window.tunjukTeksDarurat("Mic error Bos: " + e.error + ". Taip saja ya."); };
    }
    rec.start(); micNyala = true;
    if(window.MAVIX.manajer) window.MAVIX.manajer.setStatus("Mavix mendengarkan...");
  }catch(e){
    micNyala = false;
    if(window.MAVIX.manajer) window.MAVIX.manajer.setStatus("Mic tak boleh mula Bos, cuba tekan lagi. " + e.message);
    if(window.tunjukTeksDarurat) window.tunjukTeksDarurat("Mic tak hidup Bos, taip saja di sini ya.");
  }
}
// INI YANG TADI HILANG: Pasang tombol + layar sekali saja, jangan 2 kali
function pasangTombolMic(){
  if(sudahPasangTelinga) return;
  sudahPasangTelinga = true;
  const tombol = document.getElementById('tombolMic');
  if(tombol){
    tombol.addEventListener('click', (e) => { e.stopPropagation(); mulaDengar(); });
  }
  // Layar suara cuma pasang kalau ada, dan cuma 1 kali
  const layar = document.getElementById('layar-suara');
  if(layar && !layar.dataset.mavixPasang){
    layar.dataset.mavixPasang = "1";
    layar.addEventListener('click', () => { mulaDengar(); });
  }
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', pasangTombolMic);
} else {
  pasangTombolMic();
}
window.mulaDengar = mulaDengar;
window.hentikanDengar = hentikanDengar;
window.tekanMic = mulaDengar;
window.pasangTombolMic = pasangTombolMic;
