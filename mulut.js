// MULUT MAVIX V2.3 - BACA PANJANG SAMPAI HABIS
let audioSekarang = null;
let sedangBicara = false;
let antrianSuara = [];
let sedangMainAntrian = false;
function bersihkanTeksUntukSuara(teks) {
  if (!teks) return "";
  return teks.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#{1,6}\s?/g, "").replace(/\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "$1").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}
function potongTeksPanjang(teks) {
  teks = bersihkanTeksUntukSuara(teks);
  if (!teks) return [];
  if (teks.length <= 700) return [teks];
  let keping = [];
  let ayat = teks.split(/(?<=[.!?])\s+/);
  let sekarang = "";
  for (let a of ayat) {
    if ((sekarang + " " + a).length > 700) {
      if (sekarang) keping.push(sekarang.trim());
      if (a.length > 700) { for (let i = 0; i < a.length; i += 700) keping.push(a.slice(i, i + 700).trim()); sekarang = ""; }
      else sekarang = a;
    } else sekarang = (sekarang + " " + a).trim();
  }
  if (sekarang) keping.push(sekarang.trim());
  return keping;
}
async function mainAntrian() {
  if (sedangMainAntrian) return;
  sedangMainAntrian = true;
  while (antrianSuara.length > 0) {
    if (!sedangBicara) break;
    let teksKeping = antrianSuara[0];
    await cakapSatuKeping(teksKeping);
    antrianSuara.shift();
    if (!sedangBicara) break;
  }
  sedangMainAntrian = false;
  sedangBicara = false;
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}
function cakapSatuKeping(teks) {
  return new Promise(async (selesai) => {
    if (!teks) { selesai(true); return; }
    try {
      let respon = await fetch("/suara?teks=" + encodeURIComponent(teks));
      if (!respon.ok) throw new Error("Edge gagal");
      let blob = await respon.blob();
      let url = URL.createObjectURL(blob);
      audioSekarang = new Audio(url);
      audioSekarang.onended = function() { try { URL.revokeObjectURL(url); } catch(e){} audioSekarang = null; selesai(true); };
      audioSekarang.onerror = function() { try { URL.revokeObjectURL(url); } catch(e){} audioSekarang = null; bicaraHP(teks, function(){ selesai(true); }); };
      audioSekarang.play().catch(() => { bicaraHP(teks, function(){ selesai(true); }); });
    } catch (e) { bicaraHP(teks, function(){ selesai(true); }); }
  });
}
function bicaraHP(teks, selesai) {
  if (!("speechSynthesis" in window)) { if (selesai) selesai(); return; }
  window.speechSynthesis.cancel();
  let ucap = new SpeechSynthesisUtterance(teks);
  ucap.lang = "id-ID"; ucap.rate = 1; ucap.pitch = 1.1;
  ucap.onend = function() { if (selesai) selesai(); };
  ucap.onerror = function() { if (selesai) selesai(); };
  window.speechSynthesis.speak(ucap);
}
async function bicara(teks) {
  stopMulut();
  teks = bersihkanTeksUntukSuara(teks);
  if (!teks) return;
  antrianSuara = potongTeksPanjang(teks);
  sedangBicara = true;
  if (typeof mavixNgomong === "function") mavixNgomong(true);
  await mainAntrian();
}
function stopMulut() {
  sedangBicara = false;
  sedangMainAntrian = false;
  antrianSuara = [];
  if (audioSekarang) { try{ audioSekarang.pause(); }catch(e){} audioSekarang = null; }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (typeof mavixNgomong === "function") mavixNgomong(false);
}
window.bicara = bicara;
window.stopMulut = stopMulut;
window.potongTeksPanjang = potongTeksPanjang;
