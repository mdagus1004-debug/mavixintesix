// mulut.js - VERSI TERAKHIR IKUT BOS
// 1 = 2 detik, Bos diam 2 detik, baru proses
// 2 = Mavix jangan diam masa otak mikir, terus ngomong teks lama, sudah dapat jawaban baru potong
// 3 = TAK PAKAI, SUDAH BUANG

let suaraTerpilih = null;

window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;
window.MAVIX.kalimatSekarang = "";
window.MAVIX.micNyala = window.MAVIX.micNyala || false;
window.MAVIX.recognition = window.MAVIX.recognition || null;
window.MAVIX.tampungPesan = "";
window.MAVIX.adaTampung = false;
window.MAVIX.antrianTerakhir = "";
window.MAVIX.waktuBosMulaiNgomong = 0;

function siapkanSuara(){
  const list = window.speechSynthesis.getVoices();
  suaraTerpilih = list.find(v => v.lang === "id-ID") || list.find(v => v.lang.startsWith("id")) || list[0];
}
window.speechSynthesis.onvoiceschanged = siapkanSuara;
siapkanSuara();

function bicara(teks){
  // Bila jawaban SUDAH dapat, barulah potong teks lama, timpa dengan jawaban baru
  // Sebelum bicara() dipanggil, Mavix terus ngomong teks lama, dia tidak diam
  try{ window.speechSynthesis.cancel(); }catch(e){}
  window.MAVIX.kalimatSekarang = teks;
  window.MAVIX.sedangNgomong = true;
  setStatusMulut("Mavix ngomong: " + teks);

  const ucapan = new SpeechSynthesisUtterance(teks);
  ucapan.lang = "id-ID"; ucapan.rate = 1.0; ucapan.pitch = 1.0;
  if(suaraTerpilih) ucapan.voice = suaraTerpilih;

  ucapan.onend = function(){
    window.MAVIX.sedangNgomong = false;
    window.MAVIX.kalimatSekarang = "";
    setStatusMulut("Lagi dengerin Bos...");
    hidupkanMicLagi();
  };

  ucapan.onerror = function(){
    window.MAVIX.sedangNgomong = false;
    window.MAVIX.kalimatSekarang = "";
    hidupkanMicLagi();
  };

  window.speechSynthesis.speak(ucapan);
}

function hentikanMavixKarenaBosNgomong(){
  try{ window.speechSynthesis.cancel(); }catch(e){}
  window.MAVIX.sedangNgomong = false;
  window.MAVIX.kalimatSekarang = "";
  setStatusMulut("Sudah dapat jawaban, potong teks lama...");
  hidupkanMicLagi();
}

function setStatusMulut(teks){
  const s = document.getElementById("status");
  if(s) s.innerText = teks;
}
function hidupkanMicLagi(){
  if(window.MAVIX.recognition && window.MAVIX.micNyala){
    try{ window.MAVIX.recognition.start(); }catch(e){}
  }
}

window.bicara = bicara;
window.stopMulut = hentikanMavixKarenaBosNgomong;
window.potongMavix = hentikanMavixKarenaBosNgomong;
window.hentikanMavixKarenaBosNgomong = hentikanMavixKarenaBosNgomong;
