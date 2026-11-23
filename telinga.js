// ==========================================
// telinga.js - TELINGA MAVIX - VERSI BERSIH
// Kerja dia: DENGAR SAJA
// Tidak bungkus bicara(), tidak selit perintah, tidak bikin ingatan baru
// ==========================================

var recognition = null;
var telingaJalan = false;
var micMauJalan = false;
var sedangMulai = false;
var mavixLagiNgomong = false;
var teksTerakhirMavix = "";
var waktuMavixSelesai = 0;

// ===== PERINTAH BOS =====
var perintahBos = [];
try { perintahBos = JSON.parse(localStorage.getItem('perintahBos') || '[]'); } catch(e) { perintahBos = []; }

function simpanPerintah(perintah){
  if(!perintah) return;
  perintahBos.push({ perintah: perintah, waktu: Date.now() });
  if(perintahBos.length > 20) perintahBos.shift();
  try { localStorage.setItem('perintahBos', JSON.stringify(perintahBos)); } catch(e) {}
}
window.simpanPerintah = simpanPerintah;

function buatKonteksPerintah(){
  if(perintahBos.length === 0) return "";
  var daftar = perintahBos.map(function(p,i){ return (i+1) + ". " + p.perintah; }).join("\n");
  return "PERINTAH DARI BOS YANG WAJIB KAMU IKUTI:\n" + daftar;
}
window.dapatKonteksMavix = buatKonteksPerintah;
window.dapatKonteksGadis = buatKonteksPerintah;

// ===== DIPANGGIL OLEH MULUT.JS YANG BERSIH =====
window.setMavixNgomong = function(ngomong, teks){
  mavixLagiNgomong = ngomong;
  if(teks) teksTerakhirMavix = String(teks).toLowerCase().trim();
  var s = document.getElementById("statusSuara");
  if(ngomong){
    if(s) s.textContent = "Mavix lagi ngomong... Mic diam";
    try { if(recognition) recognition.stop(); } catch(e) {}
  } else {
    waktuMavixSelesai = Date.now();
    if(s) s.textContent = "Otomatis dengerin... Ngomong aja Bos";
    setTimeout(function(){ if(micMauJalan) mulaiTelingaHP(); }, 1000);
  }
};
window.setGadisNgomong = window.setMavixNgomong;

function cekPerintah(teks){
  var t = teks.toLowerCase();
  if(t.indexOf("ingat ya") !== -1 || t.indexOf("simpan perintah") !== -1 || t.indexOf("jangan lupa") !== -1 || t.indexOf("mulai sekarang") !== -1 || t.indexOf("tolong ingat") !== -1){
    simpanPerintah(teks);
    setTimeout(function(){ if(window.bicara) window.bicara("Oke Bos, sudah disimpan. Mavix ingat kok."); }, 400);
    return true;
  }
  return false;
}

function buatTelinga(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("Buka pakai Google Chrome Bos"); return null; }
  var r = new SR();
  r.lang = "id-ID";
  r.continuous = true;
  r.interimResults = false;

  r.onstart = function(){
    telingaJalan = true; sedangMulai = false;
    var s = document.getElementById("statusSuara");
    if(s) s.textContent = "Otomatis dengerin... Ngomong aja Bos";
    var b = document.getElementById("btnMic");
    if(b) b.style.background = "red";
  };

  r.onend = function(){
    telingaJalan = false; sedangMulai = false;
    if(micMauJalan && !mavixLagiNgomong){ setTimeout(function(){ mulaiTelingaHP(); }, 300); }
  };

  r.onerror = function(e){
    sedangMulai = false; telingaJalan = false;
    if(e.error === "not-allowed"){
      alert("Mic kena blok! Izinkan mic dulu Bos");
      micMauJalan = false;
      var s2 = document.getElementById("statusSuara");
      if(s2) s2.textContent = "Mic kena blok, izinkan dulu ya Bos";
    }
  };

  r.onresult = function(event){
    if(mavixLagiNgomong) return;
    if(Date.now() - waktuMavixSelesai < 1200) return;
    var teks = event.results[event.results.length - 1][0].transcript.trim();
    if(!teks) return;

    // Anti gema ringan
    var bersihDengar = teks.toLowerCase().trim();
    var bersihMavix = teksTerakhirMavix;
    if(bersihMavix && bersihDengar.length > 3){
      if(bersihMavix.indexOf(bersihDengar) !== -1 || bersihDengar.indexOf(bersihMavix) !== -1) return;
    }

    var bersih = teks.toLowerCase().replace(/[.,!?;:\s]+$/g, "").trim();
    if(bersih === "terima kasih") return;
    if(cekPerintah(teks)) return;

    var input = document.getElementById("input");
    if(input) input.value = teks;

    // BERSIH: kirim teks bersih saja. Otak yang akan baca perintah sendiri.
    if(typeof kirimPesanSuara === "function") kirimPesanSuara(teks);
    else if(typeof kirim === "function") kirim();
  };
  return r;
}

function mulaiTelingaHP(){
  if(telingaJalan || sedangMulai) return;
  if(mavixLagiNgomong) return;
  if(!recognition) recognition = buatTelinga();
  if(!recognition) return;
  sedangMulai = true;
  try { recognition.start(); } catch(e) { sedangMulai = false; }
}

function toggleMic(){
  if(micMauJalan){
    micMauJalan = false;
    try { if(recognition) recognition.stop(); } catch(e) {}
    var b = document.getElementById("btnMic");
    if(b) b.style.background = "#1e90ff";
    var s = document.getElementById("statusSuara");
    if(s) s.textContent = "Mic mati - Tekan mic, lalu bicara";
  } else {
    micMauJalan = true;
    if(typeof stopMulut === "function"){ try{ stopMulut(); }catch(e){} }
    mulaiTelingaHP();
  }
}
window.toggleMic = toggleMic;
window.mulaDengar = toggleMic;
window.stopDengar = function(){
  micMauJalan = false;
  try { if(recognition) recognition.stop(); } catch(e) {}
  var b = document.getElementById("btnMic");
  if(b) b.style.background = "#1e90ff";
};
