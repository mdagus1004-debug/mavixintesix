// telinga.js - VERSI SUDAH DIBETULI, JANGAN DENGAR SUARA SENDIRI LAGI
window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;
window.MAVIX.sedangNgomong = window.MAVIX.sedangNgomong || false;
window.MAVIX.tampungPesan = window.MAVIX.tampungPesan || "";
window.MAVIX.adaTampung = window.MAVIX.adaTampung || false;
window.MAVIX.timerJawab = null;
window.MAVIX.antrianTerakhir = "";
window.MAVIX.waktuBosMulaiNgomong = window.MAVIX.waktuBosMulaiNgomong || 0;
window.MAVIX.teksMavixTerakhir = window.MAVIX.teksMavixTerakhir || "";
window.MAVIX.waktuMavixNgomongTerakhir = window.MAVIX.waktuMavixNgomongTerakhir || 0;

const WAKTU_SUARA_BOS_HABIS = 2000; // 2 detik

function setStatus(teks){
  const a = document.getElementById("status");
  if(a) a.innerText = teks;
  const b = document.getElementById("statusSuara");
  if(b) b.innerText = teks;
}

// === INI YANG SUDAH DIBETULI, BOS - YANG INI YANG BIKIN MUTER TADI ===
function iniSuaraMavixSendiri(teksBos){
  if(!teksBos) return false;
  let a = teksBos.toLowerCase().trim();

  // Ambil ayat Mavix yang baru saja dia cakap
  let b1 = (window.MAVIX.kalimatSekarang || "").toLowerCase().trim();
  let b2 = (window.MAVIX.teksMavixTerakhir || "").toLowerCase().trim();
  let b = b2 || b1;
  if(!b) return false;

  // 1. Kalau ayat Bos SAMA BETUL dengan ayat Mavix, buang terus
  // Contoh: Bos dengar "halo bos ada yang bisa saya bantu" = ayat Mavix tadi, buang
  if(a === b) return true;
  if(b.includes(a) && a.length > 3) return true;
  if(a.includes(b) && b.length > 3) return true;

  // 2. Kalau 70% kata sama dengan ayat Mavix, buang
  let kataBos = a.split(" ");
  let sama = 0;
  for(let k of kataBos){
    if(k.length > 2 && b.includes(k)) sama++;
  }
  if(kataBos.length > 0 && (sama / kataBos.length) > 0.7) return true;

  // 3. Kalau Bos dengar ini dalam masa 3 detik lepas Mavix ngomong, dan ayat dia hampir sama, buang
  // Ini untuk cover kalau sedangNgomong sudah jadi false, tapi suara Mavix masih masuk ke mic
  let selisih = Date.now() - (window.MAVIX.waktuMavixNgomongTerakhir || 0);
  if(selisih < 3000 && sama > 0) return true;

  return false;
}

function iniTopikBaru(teksBaru){
  let t = teksBaru.toLowerCase();
  if(t.includes("eh, bukan") || t.includes("eh bukan") || t.includes("eh, lupa") || t.includes("eh lupa") || t.includes("bukan, saya") || t.includes("ganti") || t.includes("batal")) return true;
  return false;
}

function buatTelinga(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("Pakai Chrome ya Bos"); return null; }
  const rec = new SR();
  rec.lang = "id-ID";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onresult = function(event){
    let hasilFinal = "";
    let hasilSementara = "";
    for(let i = event.resultIndex; i < event.results.length; i++){
      let hasil = event.results[i][0].transcript.trim();
      if(event.results[i].isFinal) hasilFinal += hasil;
      else hasilSementara += hasil;
    }

    if(hasilSementara && !hasilFinal){
      if(window.MAVIX.timerJawab) clearTimeout(window.MAVIX.timerJawab);
      setStatus("Dengar: " + hasilSementara + "... (Bos masih ngomong, tunggu habis dulu)");
      return;
    }

    if(hasilFinal){
      let teks = hasilFinal.trim();
      if(!teks) return;

      // === INI YANG BARU, BOS: JANGAN HARAP sedangNgomong SAJA ===
      // Kalau ayat ini sama dengan ayat Mavix tadi, buang terus, tak kira sedangNgomong true ke false
      if(iniSuaraMavixSendiri(teks)){
        setStatus("Itu suara Mavix sendiri, saya buang saja, bukan suara Bos");
        return;
      }

      if(iniTopikBaru(teks) || window.MAVIX.antrianTerakhir === ""){
        window.MAVIX.antrianTerakhir = teks;
      } else {
        window.MAVIX.antrianTerakhir = window.MAVIX.antrianTerakhir + " " + teks;
      }
      window.MAVIX.tampungPesan = window.MAVIX.antrianTerakhir;
      window.MAVIX.adaTampung = true;
      setStatus("Dengar: " + window.MAVIX.antrianTerakhir + " (Tampung dulu, tunggu Bos diam 2 detik...)");

      if(window.MAVIX.timerJawab) clearTimeout(window.MAVIX.timerJawab);
      window.MAVIX.timerJawab = setTimeout(function(){
        if(window.MAVIX.antrianTerakhir !== ""){
          const yangBosCakap = window.MAVIX.antrianTerakhir;
          window.MAVIX.antrianTerakhir = "";
          window.MAVIX.tampungPesan = "";
          window.MAVIX.adaTampung = false;
          window.MAVIX.waktuBosMulaiNgomong = 0;
          setStatus("Suara Bos sudah habis, Bos diam 2 detik, sudah ngerti, langsung proses...");
          kirimKeOtak(yangBosCakap);
        }
      }, WAKTU_SUARA_BOS_HABIS);
    }
  };

  rec.onend = function(){
    // Jangan auto-start di sini kalau Mavix tengah ngomong, biar mulut.js yang buka balik
    if(window.MAVIX.micNyala && !window.MAVIX.sedangNgomong){
      try{ rec.start(); }catch(e){}
    }
  };

  rec.onerror = function(e){
    if(e.error === "not-allowed"){
      window.MAVIX.micNyala = false;
      updateTombolMic();
    }
  };
  return rec;
}

function tekanMic(){
  if(!window.MAVIX.recognition) window.MAVIX.recognition = buatTelinga();
  if(!window.MAVIX.recognition) return;
  if(!window.MAVIX.micNyala){
    window.MAVIX.micNyala = true;
    window.MAVIX.antrianTerakhir = "";
    window.MAVIX.tampungPesan = "";
    window.MAVIX.adaTampung = false;
    window.MAVIX.waktuBosMulaiNgomong = 0;
    try{ window.MAVIX.recognition.start(); }catch(e){}
    updateTombolMic();
    setStatus("Lagi dengerin Bos...");
  } else {
    window.MAVIX.micNyala = false;
    if(window.MAVIX.timerJawab) clearTimeout(window.MAVIX.timerJawab);
    window.MAVIX.antrianTerakhir = "";
    window.MAVIX.tampungPesan = "";
    window.MAVIX.adaTampung = false;
    window.MAVIX.waktuBosMulaiNgomong = 0;
    try{ window.MAVIX.recognition.stop(); }catch(e){}
    updateTombolMic();
    setStatus("Mic mati");
  }
}

function updateTombolMic(){
  const btn = document.getElementById("btnMic");
  if(btn){ btn.style.background = window.MAVIX.micNyala ? "#ff4444" : "#1e90ff"; }
}

function kirimKeOtak(teks){
  const yangBosCakapPenuh = teks.trim();
  setStatus("Mavix mikir: " + yangBosCakapPenuh + " (Mavix terus ngomong teks lama, jangan diam)");
  if(typeof tambah === "function") tambah('user', yangBosCakapPenuh);
  if(typeof kirimPesanSuara === "function"){ kirimPesanSuara(yangBosCakapPenuh); }
  else if(typeof bicara === "function"){ bicara("Saya dengar Bos bilang: " + yangBosCakapPenuh); }
}

window.tekanMic = tekanMic;
