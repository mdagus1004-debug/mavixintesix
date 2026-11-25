// MULUT MAVIX V2.4 - 3 LAPIS SUARA
// Perbaikan: potong 800 karakter di depan, bersihkan audio saat selesai
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
async function bicaraServer(teks) {
  try {
    if (audioServer) { audioServer.pause(); audioServer = null; }
    try { speechSynthesis.cancel(); } catch(e) {}
    const res = await fetch("/suara?teks=" + encodeURIComponent(teks.slice(0,800)));
    if (!res.ok) return false;
    const blob = await res.blob();
    if (!blob || blob.size < 100) return false;
    const url = URL.createObjectURL(blob);
    audioServer = new Audio(url);
    audioServer.onended = () => { audioServer = null; };
    await audioServer.play();
    return true;
  } catch (e) { audioServer = null; return false; }
}
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
function bicaraBawaan(teks) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = "id-ID"; u.rate = 1; u.pitch = 1; u.volume = 1;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}
async function bicara(teks) {
  if (!teks) return;
  const okServer = await bicaraServer(teks);
  if (okServer) return;
  const okEdge = bicaraEdge(teks);
  if (okEdge) return;
  bicaraBawaan(teks);
}
function stopBicara() {
  try { if (audioServer) { audioServer.pause(); audioServer = null; } } catch(e) {}
  try { speechSynthesis.cancel(); } catch(e) {}
}
