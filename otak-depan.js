// OTAK DEPAN - MANAJER MAVIX - VERSI BERSIH + AUTO MATI V4.1
// PERBAIKAN NOMOR 2: Kirim namaBos, kesukaan, perasaan ke server

function ambilDataBosDariCatatan(catatan){
  let nama = "", suka = "", rasa = "";
  try{
    if(catatan){
      let m1 = catatan.match(/Nama\s*:\s*([^\n]+)/i);
      if(m1) nama = m1[1].trim();
      let m2 = catatan.match(/Suka\s*:\s*([^\n]+)/i);
      if(m2) suka = m2[1].trim();
      let m3 = catatan.match(/Perasaan\s*:\s*([^\n]+)/i);
      if(m3) rasa = m3[1].trim();
    }
  }catch(e){}
  return { namaBos: nama, kesukaan: suka, perasaan: rasa };
}

function jawabSuara(jawaban){
  if(typeof tambah === 'function') tambah('mavix', jawaban);
  try{ if(typeof simpanChat === 'function') simpanChat("assistant", jawaban); }catch(e){}
  if(typeof bicara === 'function'){
    bicara(jawaban, () => {
      if(window.MAVIX && window.MAVIX.matikanMicOtomatis){
        window.MAVIX.matikanMicOtomatis();
      }
    });
  }
}

// FUNGSI INTI - Dipakai ketik dan suara, supaya tidak dobel
async function prosesPesan(teks, dariSuara){
  // 1. Tanya Kecil dulu
  try{
    if(typeof OtakKecil !== 'undefined' && typeof OtakKecil.fikirKecil === 'function'){
      let j = OtakKecil.fikirKecil(teks);
      if(j && j.trim() !== ''){
        if(j === "__STOP__"){
          if(typeof stopMulut === 'function') stopMulut();
          if(dariSuara) jawabSuara("Oke Bos, saya diam dulu.");
          else {
            tambah('mavix', "Oke Bos, saya diam dulu.");
            try{ if(typeof simpanChat === 'function') simpanChat("assistant", "Oke Bos, saya diam dulu."); }catch(e){}
          }
          return true;
        }
        if(dariSuara) jawabSuara(j);
        else {
          tambah('mavix', j);
          try{ if(typeof simpanChat === 'function') simpanChat("assistant", j); }catch(e){}
          if(typeof bicara === 'function') bicara(j);
        }
        return true;
      }
    }
  }catch(e){}

  // 2. Kalau Kecil tidak tahu, tanya Tengah
  try{
    if(typeof OtakTengah !== 'undefined' && OtakTengah.fikir){
      let modeS = (typeof window.modeMavix !== 'undefined' && window.modeMavix) ? window.modeMavix : "NGOBROL";
      const jt = await OtakTengah.fikir(teks, modeS);
      if(jt && jt.trim() !== ''){
        if(dariSuara) jawabSuara(jt);
        else {
          tambah('mavix', jt);
          try{ if(typeof simpanChat === 'function') simpanChat("assistant", jt); }catch(e){}
          if(typeof bicara === 'function') bicara(jt);
        }
        return true;
      }
    }
  }catch(e){}

  // 3. Kalau Tengah tidak tahu, baru ke Besar / server
  try{
    let catatan = ""; try{ if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); }catch(e){}
    let chatTerakhir = ""; try{ if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); }catch(e){}
    let ringkasan = ""; try{ if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); }catch(e){}
    let konteksPerintah = ""; try{ if(typeof window.dapatKonteksMavix === "function") konteksPerintah = window.dapatKonteksMavix(); }catch(e){}
    let pesanLengkap = "";
    if(konteksPerintah) pesanLengkap += konteksPerintah + "\n\n";
    if(catatan) pesanLengkap += catatan + "\n\n";
    if(ringkasan) pesanLengkap += ringkasan + "\n\n";
    if(chatTerakhir) pesanLengkap += "CHAT TERAKHIR:\n" + chatTerakhir + "\n\n";
    pesanLengkap += "Pertanyaan Bos: " + teks;
    let modeKirim = (typeof window.modeMavix !== 'undefined' && window.modeMavix) ? window.modeMavix : "NGOBROL";
    let dataBos = ambilDataBosDariCatatan(catatan);
    const res = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: pesanLengkap, mode: modeKirim, namaBos: dataBos.namaBos, kesukaan: dataBos.kesukaan, perasaan: dataBos.perasaan }) });
    if(!res.ok) throw new Error("Server jawab " + res.status);
    const data = await res.json();
    const jawab = data.reply || 'Bos, saya tidak dapat jawab tadi!';
    if(dariSuara) jawabSuara(jawab);
    else {
      tambah('mavix', jawab);
      try{ if(typeof simpanChat === 'function') simpanChat("assistant", jawab); }catch(e){}
      if(typeof bicara === 'function') bicara(jawab);
    }
    return true;
  }catch(e){
    if(dariSuara){ if(typeof bicara === 'function') bicara('Bos, server saya lagi tidur: ' + e.message); }
    else { tambah('mavix', 'Bos, server saya lagi tidur: ' + e.message); }
    return false;
  }
}

async function kirim(){
  const inp = document.getElementById('input');
  if(!inp) return;
  const teks = inp.value.trim();
  if(!teks) return;
  tambah('user', teks);
  inp.value = ''; inp.focus();
  try{ if(typeof simpanChat === 'function') simpanChat("user", teks); }catch(e){}
  await prosesPesan(teks, false);
}
document.addEventListener('DOMContentLoaded', function(){ const b = document.getElementById('kirimBtn'); if(b) b.addEventListener('click', kirim); });
window.kirim = kirim;

async function kirimPesanSuara(teks){
  if(!teks) return; teks = teks.trim(); if(!teks) return;
  if(window.MAVIX) window.MAVIX.sudahKirim = true;
  if(typeof tambah === 'function') tambah('user', teks);
  try{ if(typeof simpanChat === 'function') simpanChat("user", teks); }catch(e){}
  await prosesPesan(teks, true);
}
window.kirimPesanSuara = kirimPesanSuara;
