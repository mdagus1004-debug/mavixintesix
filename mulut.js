window.MAVIX = window.MAVIX || {};
function hentikanBicara(){
  try{ window.speechSynthesis.cancel(); }catch(e){}
  try{ const a = document.getElementById('audioMavix'); if(a){ a.pause(); a.src=""; } }catch(e){}
  window.MAVIX.sedangNgomong = false;
  if(window.MAVIX.manajer) window.MAVIX.manajer.selesaiNgomong();
  document.dispatchEvent(new CustomEvent('mavix-selesai-ngomong'));
}
function stopMulut(){ hentikanBicara(); }
function bicara(teks){
  if(!teks) return;
  if(window.MAVIX.manajer) window.MAVIX.manajer.mulaiNgomong();
  window.MAVIX.sedangNgomong = true;
  document.dispatchEvent(new CustomEvent('mavix-mula-ngomong'));
  (async () => {
    try{
      const r = await fetch('/suara?teks=' + encodeURIComponent(teks.slice(0,800)));
      if(r.ok){
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        let a = document.getElementById('audioMavix');
        if(!a){ a = document.createElement('audio'); a.id='audioMavix'; a.style.display='none'; document.body.appendChild(a); }
        a.src = url;
        a.onended = () => { hentikanBicara(); };
        a.onerror = () => { pakaiSuaraHP(teks); };
        await a.play();
        return;
      }
      pakaiSuaraHP(teks);
    }catch(e){ pakaiSuaraHP(teks); }
  })();
}
function pakaiSuaraHP(teks){
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = 'id-ID'; u.rate = 1; u.pitch = 1;
    u.onend = () => { hentikanBicara(); };
    u.onerror = () => { hentikanBicara(); };
    window.speechSynthesis.speak(u);
  }catch(e){ hentikanBicara(); }
}
window.bicara = bicara;
window.hentikanBicara = hentikanBicara;
window.stopMulut = stopMulut;
window.MAVIX.sedangNgomong = false;
