// mulut.js - 1 MULUT SAJA, SUDAH ADA STOP
let suaraTerpilih = null;
function siapkanSuara(){
  const list = window.speechSynthesis.getVoices();
  suaraTerpilih = list.find(v => v.lang === "id-ID") || list.find(v => v.lang.startsWith("id")) || list[0];
}
window.speechSynthesis.onvoiceschanged = siapkanSuara;
siapkanSuara();
function bicara(teks){
  sedangNgomong = true;
  if(timerJawab) clearTimeout(timerJawab);
  if(recognition && micNyala){ try{ recognition.stop(); }catch(e){} }
  const s = document.getElementById("status"); if(s) s.innerText = "Mavix lagi ngomong... Mic diam";
  window.speechSynthesis.cancel();
  const ucapan = new SpeechSynthesisUtterance(teks);
  ucapan.lang = "id-ID"; ucapan.rate = 1.0; ucapan.pitch = 1.0;
  if(suaraTerpilih) ucapan.voice = suaraTerpilih;
  ucapan.onend = function(){
    sedangNgomong = false;
    const s2 = document.getElementById("status"); if(s2) s2.innerText = "Lagi dengerin Bos...";
    if(micNyala && recognition){ try{ recognition.start(); }catch(e){} }
  };
  ucapan.onerror = function(){
    sedangNgomong = false;
    if(micNyala && recognition){ try{ recognition.start(); }catch(e){} }
  };
  window.speechSynthesis.speak(ucapan);
}
function stopMulut(){
  try{ window.speechSynthesis.cancel(); }catch(e){}
  sedangNgomong = false;
  antrianTerakhir = "";
  if(timerJawab) clearTimeout(timerJawab);
  const s = document.getElementById("status"); if(s) s.innerText = "Mavix diam. Lagi dengerin Bos...";
  if(micNyala && recognition){ try{ recognition.start(); }catch(e){} }
}
window.bicara = bicara;
window.stopMulut = stopMulut;
