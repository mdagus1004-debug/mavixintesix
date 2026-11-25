// =================================================
// OTAK MULUT - 3 LAPIS
// Lapis 1: Server Bos /suara -> id-ID-GadisNeural (paling bagus)
// Lapis 2: Kalau Server gagal, Edge Browser -> Microsoft
// Lapis 3: Kalau Edge gagal, Suara Bawaan HP
// =================================================
let audioServer = null;
let suaraEdge = null;

function cariSuaraEdge() {
  const semua = speechSynthesis.getVoices() || [];
  if (!semua.length) return null;
  let pilih = semua.find(v => v.name.includes("Microsoft") && v.lang.includes("id-ID"));
  if (pilih) return pilih;
  pilih = semua.find(v => v.name.includes("Microsoft"));
  if (pilih) return pilih;
  return null;
}
if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => { suaraEdge = cariSuaraEdge(); };
  suaraEdge = cariSuaraEdge();
}

// LAPIS 1: Server EdgeTTS Bos
async function bicaraServer(teks) {
  try {
    if (audioServer) { audioServer.pause(); audioServer = null; }
    try { speechSynthesis.cancel(); } catch(e) {}
    const res = await fetch("/suara?teks=" + encodeURIComponent(teks));
    if (!res.ok) return false;
    const blob = await res.blob();
    if (!blob || blob.size < 100) return false;
    const url = URL.createObjectURL(blob);
    audioServer = new Audio(url);
    await audioServer.play();
    return true;
  } catch (e) { return false; }
}

// LAPIS 2: Edge Browser
function bicaraEdge(teks) {
  try {
    if (!suaraEdge) suaraEdge = cariSuaraEdge();
    if (!suaraEdge) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.voice = suaraEdge;
    u.lang = suaraEdge.lang;
    u.rate = 1; u.pitch = 1; u.volume = 1;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

// LAPIS 3: Bawaan HP
function bicaraBawaan(teks) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = "id-ID"; u.rate = 1; u.pitch = 1; u.volume = 1;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

// Depan cuma panggil ini
async function bicara(teks) {
  if (!teks) return;
  // Coba Lapis 1 dulu
  const okServer = await bicaraServer(teks);
  if (okServer) return;
  // Gagal, coba Lapis 2
  const okEdge = bicaraEdge(teks);
  if (okEdge) return;
  // Gagal, coba Lapis 3
  bicaraBawaan(teks);
}

function stopBicara() {
  try { if (audioServer) { audioServer.pause(); audioServer = null; } } catch(e) {}
  try { speechSynthesis.cancel(); } catch(e) {}
}
