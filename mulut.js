// mulut.js - VERSI BROWSER, JANGAN PAKAI require
let wsMulut = null;
let audioCtx = null;
let antrianAudio = [];

function sambungMulut() {
  // GANTI dengan link Render Bos yang sebenar
  const URL_RENDER = "wss://mavixintesix.onrender.com";
  wsMulut = new WebSocket(URL_RENDER);

  wsMulut.binaryType = "arraybuffer";

  wsMulut.onopen = () => {
    console.log("Mulut dah sambung");
  };

  wsMulut.onmessage = async (event) => {
    if (typeof event.data === "string") return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await audioCtx.decodeAudioData(event.data.slice(0));
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start();
  };

  wsMulut.onclose = () => {
    setTimeout(sambungMulut, 2000);
  };
}

function cakap(teks) {
  if (!wsMulut || wsMulut.readyState !== 1) {
    console.log("Mulut belum sambung, cuba lagi...");
    setTimeout(() => cakap(teks), 500);
    return;
  }
  wsMulut.send(JSON.stringify({ teks: teks }));
}

// Auto sambung bila buka page
sambungMulut();
