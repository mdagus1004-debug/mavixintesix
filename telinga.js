// telinga.js - VERSI TERAKHIR IKUT BOS
// 1 = Bagi dia 2 detik, 2 detik saja, Bos diam 2 detik, baru kira suara Bos sudah habis
// 2 = Jangan potong Mavix masa kirim ke otak, biar Mavix terus ngomong teks lama, otak mikir di belakang
// 3 = TAK PAKAI, SUDAH BUANG
// TAMPUNG = Simpan dulu, jangan kirim lagi, tunggu lengkap, baru kirim sekali gus

window.MAVIX = window.MAVIX || {};
window.MAVIX.micNyala = false;
window.MAVIX.recognition = null;
window.MAVIX.sedangNgomong = window.MAVIX.sedangNgomong || false;
window.MAVIX.tampungPesan = window.MAVIX.tampungPesan || "";
window.MAVIX.adaTampung = window.MAVIX.adaTampung || false;
window.MAVIX.timerJawab = null;
window.MAVIX.antrianTerakhir = "";
window.MAVIX.waktuBosMulaiNgomong = window.MAVIX.waktuBosMulaiNgomong || 0;

// === NOMBOR 1: BAGI DIA 2 DETIK, 2 DETIK SAJA ===
const WAKTU_SUARA_BOS_HABIS = 2000; // 2 detik

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

function iniSuaraMavixSendiri(teksBos, teksMavix){
  if(!teksBos || !teksMavix) return false;
  let a = teksBos.toLowerCase().trim();
  let b = teksMavix.toLowerCase().trim();
  if(b.includes(a) && a.length > 3) return true;
  let kataBos = a.split(" ");
  let sama = 0;
  for(let k of kataBos){
    if(k.length > 2 && b.includes(k)) sama++;
  }
  if(kataBos.length > 0 && (sama / kataBos.length) > 0.7) return true;
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

    // Bos masih ngomong sikit-sikit, reset timer, jangan proses dulu
    if(hasilSementara && !hasilFinal){
      if(window.MAVIX.timerJawab) clearTimeout(window.MAVIX.timerJawab);
      setStatus("Dengar: " + hasilSementara + "... (Bos masih ngomong, tunggu habis dulu)");
      return;
    }

    if(hasilFinal){
      let teks = hasilFinal.trim();
      if(!teks) return;

      if(window.MAVIX.sedangNgomong && iniSuaraMavixSendiri(teks, window.MAVIX.kalimatSekarang)){
        setStatus("Itu suara Mavix sendiri, saya buang saja, bukan suara Bos");
        return;
      }

      // === TAMPUNG = SIMPAN DULU, JANGAN KIRIM LAGI ===
      // Bos ngomong "Saya" -> tampung jadi "Saya"
      // Bos sambung "mau tanya" -> tampung jadi "Saya mau tanya"
      // Bos sambung "harga" -> tampung jadi "Saya mau tanya harga" lengkap
      if(iniTopikBaru(teks) || window.MAVIX.antrianTerakhir === ""){
        window.MAVIX.antrianTerakhir = teks;
      } else {
        window.MAVIX.antrianTerakhir = window.MAVIX.antrianTerakhir + " " + teks;
      }
      window.MAVIX.tampungPesan = window.MAVIX.antrianTerakhir;
      window.MAVIX.adaTampung = true;
      setStatus("Dengar: " + window.MAVIX.antrianTerakhir + " (Tampung dulu, tunggu Bos diam 2 detik...)");

      if(window.MAVIX.timerJawab) clearTimeout(window.MAVIX.timerJawab);

      // === NOMBOR 1: TUNGGU BOS DIAM 2 DETIK, 2 DETIK ===
      // Bos diam 2 detik, baru kira suara Bos sudah habis betul-betul, langsung proses
      // Tanpa nunggu Mavix habiskan teks bacaannya
      window.MAVIX.timerJawab = setTimeout(function(){
        if(window.MAVIX.antrianTerakhir !== ""){
          const yangBosCakap = window.MAVIX.antrianTerakhir;
          window.MAVIX.antrianTerakhir = "";
          window.MAVIX.tampungPesan = "";
          window.MAVIX.adaTampung = false;
          window.MAVIX.waktuBosMulaiNgomong = 0;

          setStatus("Suara Bos sudah habis, Bos diam 2 detik, sudah ngerti, langsung proses...");

          // === NOMBOR 2: Jangan potong Mavix di sini ===
          // Biar Mavix terus ngomong teks lama, otak mikir di belakang
          // Nanti bila jawaban sudah dapat, bicara() akan potong teks lama
          kirimKeOtak(yangBosCakap);
        }
      }, WAKTU_SUARA_BOS_HABIS);
    }
  };

  rec.onend = function(){
    if(window.MAVIX.micNyala){
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
  const yangTerakhir = ambilTerakhir(teks);
  setStatus("Mavix mikir: " + yangTerakhir + " (Mavix terus ngomong teks lama, jangan diam)");
  if(typeof tambah === "function") tambah('user', yangTerakhir);
  if(typeof kirimPesanSuara === "function"){ kirimPesanSuara(yangTerakhir); }
  else if(typeof bicara === "function"){ bicara("Saya dengar Bos bilang: " + yangTerakhir); }
}

window.tekanMic = tekanMic;
