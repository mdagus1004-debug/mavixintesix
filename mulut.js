// ================= SAKLAR =================
// false = DATABASE MATI, AI jawab sendiri
// true  = DATABASE NYALA, AI ambil data
let PAKAI_DATABASE = false;
// ===========================================
// ================= SAKLAR MODE =================
// "KERJA" = Pendek, maks 150 kata, buat jadwal
// "NGOBROL" = Panjang, maks 400 kata, buat curhat / santai
let MODE = "KERJA";
// ===============================================

function gantiMode(modeBaru){
  modeBaru = modeBaru.toUpperCase();
  if(modeBaru === "KERJA" || modeBaru === "NGOBROL"){
    MODE = modeBaru;
    if(MODE === "KERJA"){
      bicara("Siap Bos, mode kerja aktif. Aku jawab pendek aja ya, langsung ke intinya.");
    } else {
      bicara("Asik, mode ngobrol aktif Bos. Sini cerita aja, aku temenin, nggak bakal aku potong-potong.");
    }
  }
}
window.gantiMode = gantiMode;

(function() {
  let PROXY_GADIS = "https://mavixintesix-1.onrender.com";
  let audioMulut = null;
  let antrianMulut = [];
  let lagiNgomong = false;
  let sesiBicara = 0;
  let gagalProxyBeruntun = 0;

  function buatId(){ 
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ 
      var r = Math.random()*16|0, v = c=='x'?r:(r&0x3|0x8); return v.toString(16); 
    }); 
  }

  function escapeSSML(s){
    return String(s)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&apos;");
  }

  // SUARA UTAMA: SUARA GADIS LEWAT PROXY
  function bicaraEdgeViaProxy(teks, selesai){
    if(window.mavixNgomong) mavixNgomong(true);
    return new Promise((resolve)=>{
      if(!teks || typeof teks !== "string"){ selesai(false); resolve(); return; }

      let connectionId = buatId();
      let wsUrl = PROXY_GADIS.replace("https://","wss://") + "?ConnectionId=" + connectionId;
      let ws;
      try{ ws = new WebSocket(wsUrl); }catch(e){ selesai(false); resolve(); return; }

      ws.binaryType = "arraybuffer";
      let audioChunks = [];
      let sudahSelesai = false;

      function tutup(ok){
        if(window.mavixNgomong) mavixNgomong(false);
        if(sudahSelesai) return;
        sudahSelesai = true;
        try{ ws.close(); }catch(e){}
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
        selesai(ok);
        resolve();
      }

      ws.onopen = function(){
        let config = "X-Timestamp:" + new Date().toISOString() +
          "\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n" +
          "{\"context\":{\"synthesis\":{\"audio\":{\"metadataOptions\":{\"sentenceBoundaryEnabled\":false,\"wordBoundaryEnabled\":false},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}";
        try{ ws.send(config); }catch(e){ tutup(false); return; }

        let ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='id-ID'>" +
          "<voice name='id-ID-GadisNeural'><prosody rate='+0%' pitch='+0Hz'>" +
          escapeSSML(teks) +
          "</prosody></voice></speak>";
        let msg = "X-RequestId:" + connectionId +
          "\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:" + new Date().toISOString() +
          "\r\nPath:ssml\r\n\r\n" + ssml;
        try{ ws.send(msg); }catch(e){ tutup(false); }
      };

      ws.onmessage = function(e){
        if(typeof e.data === "string"){
          if(e.data.includes("Path:turn.end")){
            if(audioChunks.length === 0){ tutup(false); return; }
            let blob = new Blob(audioChunks, {type:"audio/mpeg"});
            let url = URL.createObjectURL(blob);
            if(audioMulut){
              audioMulut.onended = null;
              audioMulut.onerror = null;
              try{ audioMulut.pause(); }catch(_){}
            }
            audioMulut = new Audio(url);
            audioMulut.onended = ()=>{
              URL.revokeObjectURL(url);
              tutup(true);
            };
            audioMulut.onerror = ()=>{
              URL.revokeObjectURL(url);
              tutup(false);
            };
            audioMulut.play().catch(()=> tutup(false));
          }
        } else {
          let bytes = new Uint8Array(e.data);
          let headerEnd = -1;
          for(let i=0;i<bytes.length-3;i++){
            if(bytes[i]===13 && bytes[i+1]===10 && bytes[i+2]===13 && bytes[i+3]===10){
              headerEnd = i+4; break;
            }
          }
          if(headerEnd !== -1 && bytes.length > headerEnd + 2){
            let teksHeader = new TextDecoder().decode(bytes.slice(0, headerEnd));
            if(teksHeader.includes("Path:audio")) audioChunks.push(e.data.slice(headerEnd));
          }
        }
      };

      ws.onerror = ()=> tutup(false);
      ws.onclose = ()=> tutup(false);
    });
  }

  // SUARA CADANGAN: SUARA HP KALAU PROXY GAGAL
  function bicaraHP(teks){
    return new Promise((resolve)=>{
      if(!("speechSynthesis" in window) || !teks){ resolve(false); return; }
      try{
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(teks);
        const voices = window.speechSynthesis.getVoices();
        let pilih = voices.find(v => v.lang === "id-ID" && v.name.toLowerCase().includes("google"))
                 || voices.find(v => v.lang && v.lang.startsWith("id"))
                 || voices.find(v => v.lang === "id-ID");
        if(pilih) u.voice = pilih;
        u.lang = "id-ID";
        u.rate = 1.0;
        let selesai = false;
        const finish = (ok)=>{ if(selesai) return; selesai = true; if(window.mavixNgomong) mavixNgomong(false); resolve(ok); };
        if(window.mavixNgomong) mavixNgomong(true);
        const t = setTimeout(()=> finish(true), Math.max(8000, teks.length * 120));
        u.onend = ()=>{ clearTimeout(t); finish(true); };
        u.onerror = ()=>{ clearTimeout(t); finish(false); };
        window.speechSynthesis.speak(u);
      }catch(e){ resolve(false); }
    });
  }

  // POTONG KALIMAT PANJANG JADI POTONGAN KECIL
  function potongAyat(teks){
    let hasil = [];
    let potongan = teks.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [teks];
    for(let p of potongan){
      p = p.trim(); if(!p) continue;
      if(p.length <= 250) hasil.push(p);
      else {
        let kata = p.split(" ");
        let temp = "";
        for(let k of kata){
          if((temp + " " + k).length > 240){ hasil.push(temp.trim()); temp = k; }
          else temp += " " + k;
        }
        if(temp.trim()) hasil.push(temp.trim());
      }
    }
    return hasil;
  }

  // ANTRIAN BICARA - BIAR TIDAK BEREBUT
  async function mainAntrian(){
    if(lagiNgomong) return;
    if(antrianMulut.length === 0){ 
      window.sedangBicara = false; 
      return; 
    }
    lagiNgomong = true;
    const sesiSaatIni = sesiBicara;
    while(antrianMulut.length > 0 && sesiSaatIni === sesiBicara){
      let teks = antrianMulut.shift();
      if(!teks || typeof teks !== "string") continue;
      let ok = false;
      if(gagalProxyBeruntun < 3){
        await bicaraEdgeViaProxy(teks, (h)=>{ ok = h; });
        if(ok) gagalProxyBeruntun = 0;
        else gagalProxyBeruntun++;
      }
      if(sesiSaatIni !== sesiBicara) break;
      if(!ok){
        await bicaraHP(teks);
      }
    }
    if(sesiSaatIni === sesiBicara){
      lagiNgomong = false;
      if(antrianMulut.length === 0) window.sedangBicara = false; 
    }
  }

  // CUCI TEKS - BUANG SIMBOL DAN NOMOR HP
  function cuciTeks(teks){
    return String(teks || "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/---/g, "")
      .replace(/___/g, "")
      .replace(/```/g, "")
      .replace(/\s+/g, " ").trim();
  }

  // FUNGSI UTAMA YANG DIPANGGIL OTAK DAN BADAN
  function bicara(teks){
    teks = cuciTeks(teks || "")
      .replace(/\bWA Kak[^\n]*/gi, "")
      .replace(/\bWA\b[^\n]*/gi, "")
      .replace(/\bTelpon[^\n]*/gi, "")
      .replace(/\bTelepon[^\n]*/gi, "")
      .replace(/https?:\/\/wa\.me\/\S+/gi, "")
      .replace(/\+62[\d\s\-()]+/g, "")
      .replace(/\b08\d{8,13}\b/g, "")
      .replace(/\s+/g, " ").trim();
    if(!teks) return;
    // GUNTING PINTAR - SESUAI MODE
    let maxKata = (typeof MODE !== "undefined" && MODE === "NGOBROL") ? 400 : 150;
    let kataKata = teks.split(" ");
    if(kataKata.length > maxKata){
      if(MODE === "NGOBROL"){
        let potong = kataKata.slice(0, 400).join(" ");
        let titikTerakhir = potong.lastIndexOf(".");
        if(titikTerakhir > 100) potong = potong.slice(0, titikTerakhir + 1);
        teks = potong + " ... Lanjut nggak Bos ceritanya?";
      } else {
        teks = kataKata.slice(0, 150).join(" ") + "... Udah, segitu aja dulu Bos, sisanya tanya lagi ya.";
      }
    }
    window.sedangBicara = true; 
    sesiBicara++;
    if(audioMulut){
      audioMulut.onended = null;
      audioMulut.onerror = null;
      try{ audioMulut.pause(); }catch(_){}
    }
    if("speechSynthesis" in window){
      try{ window.speechSynthesis.cancel(); }catch(_){}
    }
    antrianMulut = potongAyat(teks);
    lagiNgomong = false;
    gagalProxyBeruntun = 0;
    mainAntrian();
  }

  // UNTUK BERHENTIKAN MULUT SECARA PAKSA DARI OTAK KECIL
  function stopMulut(){
    sesiBicara++;
    antrianMulut = [];
    lagiNgomong = false;
    window.sedangBicara = false;
    if(audioMulut){ try{ audioMulut.pause(); }catch(_){} }
    if("speechSynthesis" in window){ try{ window.speechSynthesis.cancel(); }catch(_){} }
    if(window.mavixNgomong) mavixNgomong(false);
  }

  window.tesSuara = function(){
    bicara("Halo Bos, kenalin aku Gadis lewat proxy. Sekarang aku udah bisa ngomong di Chrome, gratis pula Bos.");
  };

  window.bicara = bicara;
  window.stopMulut = stopMulut;

})();
