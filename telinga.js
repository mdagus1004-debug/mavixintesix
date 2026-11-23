// telinga.js - 1 TELINGA SAJA, YANG TERAKHIR YANG BENAR
let recognition = null;
let micNyala = false;
let antrianTerakhir = "";
let timerJawab = null;
let sedangNgomong = false;
const WAKTU_TUNGGU = 1500;

function setStatus(teks){
  const a = document.getElementById("status");
  if(a) a.innerText = teks;
  const b = document.getElementById("statusSuara");
  if(b) b.innerText = teks;
}
function ambilTerakhir(teks){
  if(!teks) return "";
  let pot = teks.split(/[,.\n]| eh | terus | lalu /);
  let akhir = pot[pot.length - 1].trim();
  if(akhir === "" && pot.length > 1) akhir = pot[pot.length - 2].trim();
  return akhir || teks.trim();
}
function buatTelinga(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("Pakai Chrome ya Bos"); return null; }
  const rec = new SR();
  rec.lang = "id-ID";
  rec.continuous = true;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = function(event){
    const hasilBaru = event.results[event.results.length - 1][0].transcript.trim();
    if(!hasilBaru) return;
    const cek = hasilBaru.toLowerCase();
    // STOP boleh tembus walau Mavix lagi ngomong
    if(cek.includes("stop") || cek.includes("diam") || cek.includes("berhenti") || cek.includes("cukup") || cek.includes("jangan ngomong")){
      if(timerJawab) clearTimeout(timerJawab);
      antrianTerakhir = "";
      if(typeof stopMulut === "function") stopMulut();
      kirimKeOtak(hasilBaru);
      return;
    }
    if(sedangNgomong) return;
    antrianTerakhir = hasilBaru;
    setStatus("Dengar: " + antrianTerakhir + " (tunggu...)");
    if(timerJawab) clearTimeout(timerJawab);
    timerJawab = setTimeout(function(){
      if(antrianTerakhir !== ""){
        const yangBenar = antrianTerakhir;
        antrianTerakhir = "";
        kirimKeOtak(yangBenar);
      }
    }, WAKTU_TUNGGU);
  };
  rec.onend = function(){ if(micNyala && !sedangNgomong){ try{ rec.start(); }catch(e){} } };
  rec.onerror = function(e){ if(e.error === "not-allowed"){ micNyala = false; updateTombolMic(); } };
  return rec;
}
function tekanMic(){
  if(!recognition) recognition = buatTelinga();
  if(!recognition) return;
  if(!micNyala){
    micNyala = true;
    antrianTerakhir = "";
    try{ recognition.start(); }catch(e){}
    updateTombolMic();
    setStatus("Lagi dengerin Bos...");
  } else {
    micNyala = false;
    if(timerJawab) clearTimeout(timerJawab);
    antrianTerakhir = "";
    try{ recognition.stop(); }catch(e){}
    updateTombolMic();
    setStatus("Mic mati");
  }
}
function updateTombolMic(){
  const btn = document.getElementById("btnMic");
  if(btn){ btn.style.background = micNyala ? "#ff4444" : "#1e90ff"; }
}
function kirimKeOtak(teks){
  const yangTerakhir = ambilTerakhir(teks);
  setStatus("Mavix mikir: " + yangTerakhir);
  if(typeof tambah === "function") tambah('user', yangTerakhir);
  if(typeof kirimPesanSuara === "function"){ kirimPesanSuara(yangTerakhir); }
  else if(typeof bicara === "function"){ bicara("Saya dengar Bos bilang: " + yangTerakhir); }
}
window.tekanMic = tekanMic;
