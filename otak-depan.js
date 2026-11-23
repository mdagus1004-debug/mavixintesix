window.MAVIX = window.MAVIX || {};
window.MAVIX.manajer = {
  sedangKirim: false,
  sedangNgomong: false,
  sedangDengar: false,
  setStatus(teks){
    const s1 = document.getElementById('status');
    if(s1) s1.innerText = teks;
    const s2 = document.getElementById('statusSuara');
    if(s2) s2.innerText = teks;
  },
  mulaiNgomong(){ this.sedangNgomong = true; this.sedangDengar = false; if(window.hentikanDengar) window.hentikanDengar(true); },
  selesaiNgomong(){ this.sedangNgomong = false; },
  mulaiDengar(){ if(this.sedangNgomong) return false; this.sedangDengar = true; return true; },
  selesaiDengar(){ this.sedangDengar = false; }
};
window.MAVIX.sedangNgomong = false;
async function kirim(teksDariSuara){
  if(window.MAVIX.manajer.sedangKirim) return;
  const inputEl = document.getElementById('input');
  let teks = (teksDariSuara || (inputEl ? inputEl.value : "") || "").trim();
  if(!teks) return;
  window.MAVIX.manajer.sedangKirim = true;
  try{
    if(inputEl) inputEl.value = "";
    if(window.tambah) window.tambah("user", teks);
    if(window.simpanChat) window.simpanChat("user", teks);
    if(window.ingatOtomatis) window.ingatOtomatis(teks);
    let jKecil = window.otakKecil ? window.otakKecil(teks) : "";
    if(jKecil){
      if(jKecil === "STOP"){ if(window.stopMulut) window.stopMulut(); if(window.tambah) window.tambah("mavix", "Baik Bos, saya diam."); return; }
      if(jKecil.startsWith("JAM:")){ let j = "Sekarang jam " + jKecil.slice(4) + " Bos."; if(window.tambah) window.tambah("mavix", j); if(window.simpanChat) window.simpanChat("mavix", j); if(window.bicara) window.bicara(j); return; }
      if(window.tambah) window.tambah("mavix", jKecil); if(window.simpanChat) window.simpanChat("mavix", jKecil); if(window.bicara) window.bicara(jKecil); return;
    }
    let jTengah = "";
    try{ jTengah = window.otakTengah ? await window.otakTengah(teks) : ""; }catch(e){ jTengah = ""; }
    if(jTengah){
      if(window.tambah) window.tambah("mavix", jTengah); if(window.simpanChat) window.simpanChat("mavix", jTengah); if(window.bicara) window.bicara(jTengah); return;
    }
    let namaBos = window.ambilCatatan ? window.ambilCatatan("nama") : "";
    let kesukaan = window.ambilCatatan ? (window.ambilCatatan("suka") + " " + window.ambilCatatan("makanan")) : "";
    let perasaan = window.ambilCatatan ? window.ambilCatatan("perasaan") : "";
    let catatan = window.buatCatatanUntukOtakBesar ? window.buatCatatanUntukOtakBesar() : "";
    let chatTerakhir = window.ambilChatTerakhir ? window.ambilChatTerakhir(6) : "";
    let pesanLengkap = catatan + "\nCHAT TERAKHIR:\n" + chatTerakhir + "\nBos: " + teks;
    let jawaban = "";
    for(let cuba = 0; cuba < 2; cuba++){
      try{
        const r = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: pesanLengkap, mode: window.modeMavix || "NGOBROL", namaBos: namaBos || "Bos", kesukaan: kesukaan.trim(), perasaan: perasaan }) });
        const d = await r.json();
        jawaban = d.reply || "";
        if(jawaban) break;
      }catch(e){ if(cuba === 1) jawaban = "Bos, server saya tidur sebentar, cuba lagi ya Bos."; else await new Promise(r=>setTimeout(r,800)); }
    }
    if(window.tambah) window.tambah("mavix", jawaban);
    if(window.simpanChat) window.simpanChat("mavix", jawaban);
    if(window.bicara) window.bicara(jawaban);
  }finally{
    window.MAVIX.manajer.sedangKirim = false;
  }
}
window.kirim = kirim;
window.kirimPesanSuara = kirim;
document.addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('kirimBtn');
  if(b) b.addEventListener('click', () => kirim());
});
