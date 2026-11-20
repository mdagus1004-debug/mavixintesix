// MULUT MAVIX - Bahasa Indonesia
// Sambung ke server.js lewat WebSocket, terus ke Microsoft Edge
// Kalau Edge mati, otomatis pakai suara HP

let wsMulut = null;
let audioCtx = null;
let sedangBicara = false;
let modeSekarang = "NGOBROL";
let idSambungan = "mavix-" + Math.random().toString(36).slice(2, 10);
let sudahKirimConfig = false;

function sambungMulut() {
  if (wsMulut && wsMulut.readyState === 1) return;
  const URL_RENDER = "wss://mavixintesix.onrender.com?ConnectionId=" + idSambungan;
  wsMulut = new WebSocket(URL_RENDER);
  wsMulut.binaryType = "arraybuffer";

  wsMulut.onopen = function() {
    console.log("Mulut sudah sambung");
    sudahKirimConfig = false;
  };

  wsMulut.onmessage = async function(event) {
    if (typeof event.data === "string") return;
    try {
      let data = event.data;
      // Edge kirim header teks + audio, kita ambil audionya saja
      let teksHeader = new TextDecoder().decode(data.slice(0, 200));
      let posisiAudio = teksHeader.indexOf("\r\n\r\n");
      if (posisiAudio !== -1) {
        // Ada header, potong headernya
        let awal = data.slice(0, 500);
        let cari = new TextDecoder().decode(awal);
        let pisah = cari.indexOf("\r\n\r\n");
        if (pisah !== -1) data = data.slice(pisah + 4);
        else return;
      }
      if (data.byteLength < 100) return;
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") await audioCtx.resume();
      const buf = await audioCtx.decodeAudioData(data.slice(0));
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      src.onended = function() { if (sedangBicara) { sedangBicara = false; if (typeof mavixNgomong === "function") mavixNgomong(false); } };
      src.start();
    } catch (e) { console.log("Audio gagal diputar, pakai cadangan"); }
  };

  wsMulut.onclose = function() {
    sedangBicara = false;
    if (typeof mavixNgomong === "function") mavixNgomong(false);
    setTimeout(sambungMulut, 2000);
  };
  wsMulut.onerror = function() { setTimeout(sambungMulut, 2000); };
}

// Kirim pesan config Edge, baru kirim SSML
function kirimKeEdge(teksBersih) {
  if (!sudahKirimConfig) {
    wsMulut.send("Path: speech.config\r\n\r\n{\"context\":{\"synthesis\":{\"audio\":{\"metadataOptions\":{\"sentenceBoundaryEnabled\":\"false\",\"wordBoundaryEnabled\":\"false\"},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}");
    sudahKirimConfig = true;
  }
  let aman = teksBersih.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='id-ID'><voice name='id-ID-GadisNeural'><prosody rate='0%' pitch='0%'>" + aman + "</prosody></voice></speak>";
  wsMulut.send("Path: ssml\r\n\r\n" + ssml);
}

function bicaraCadanganHP(teks) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  let ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = "id-ID";
  ucap.rate = 1; ucap.pitch = 1.1;
  ucap.onstart = function() { sedangBicara = true; if (typeof mavixNgomong === "function") mavixNgomong(true); };
  ucap.onend = function() { sedangBicara = false; if (typeof mavixNgomong === "function") mavixNgomong(false); };
  window.speechSynthesis.speak(ucap);
}

function bicara(teks) {
  if (!teks) return;
  stopMulut();
  if (typeof mavixNgomong === "function") mavixNgomong(true);
  sedangBicara = true;
  // Kalau WebSocket belum sambung, langsung pakai suara HP biar tidak diam
  if (!wsMulut || wsMulut.readyState !== 1) {
    bicaraCadanganHP(teks);
    // Coba sambung lagi untuk lain kali
    sambungMulut();
    return;
  }
  try {
    kirimKeEdge(teks);
    // Pengaman: kalau 3 detik tidak ada audio balik, pakai suara HP
    setTimeout(function() {
      if (sedangBicara) {
        // Biarkan Edge dulu, jangan matikan kalau sudah bunyi
      }
    }, 3000);
  } catch (e) {
    bicaraCadanganHP(teks);
  }
}

function stopMulut() {
  sedangBicara = false;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}

function gantiMode(modeBaru) {
  modeSekarang = modeBaru;
  console.log("Mode sekarang: " + modeSekarang);
  return modeSekarang;
}

window.bicara = bicara;
window.stopMulut = stopMulut;
window.gantiMode = gantiMode;
window.sedangBicara = sedangBicara;

sambungMulut();
