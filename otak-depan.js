// OTAK DEPAN - MANAJER MAVIX - VERSI BERSIH
// Kerja dia: FIKIR SAJA
// Bila mau kirim ke server, dia baca perintah dari telinga dengan terang

async function kirim(){
  const inp = document.getElementById('input');
  if(!inp) return;
  const teks = inp.value.trim();
  if(!teks) return;
  tambah('user', teks);
  inp.value = '';
  inp.focus();
  try { if(typeof ingatOtomatis === 'function') ingatOtomatis(teks); } catch(e){}
  try { if(typeof simpanChat === 'function') simpanChat("user", teks); } catch(e){}

  try {
    if (typeof OtakKecil !== 'undefined' && typeof OtakKecil.fikirKecil === 'function') {
      let jawabKecil = OtakKecil.fikirKecil(teks);
      if (jawabKecil && jawabKecil.trim() !== '') {
        if (jawabKecil === "__STOP__") {
          if (typeof stopMulut === 'function') stopMulut();
          tambah('mavix', "Oke Bos, saya diam dulu.");
          try { if(typeof simpanChat === 'function') simpanChat("assistant", "Oke Bos, saya diam dulu."); } catch(e){}
          return;
        }
        tambah('mavix', jawabKecil);
        try { if(typeof simpanChat === 'function') simpanChat("assistant", jawabKecil); } catch(e){}
        if (typeof bicara === 'function') bicara(jawabKecil);
        return;
      }
    }
  } catch(e){}

  try {
    if (typeof OtakTengah !== 'undefined' && OtakTengah.fikir) {
      const jawabTengah = await OtakTengah.fikir(teks);
      if(jawabTengah && jawabTengah.trim() !== ''){
        tambah('mavix', jawabTengah);
        try { if(typeof simpanChat === 'function') simpanChat("assistant", jawabTengah); } catch(e){}
        if (typeof bicara === 'function') bicara(jawabTengah);
        return;
      }
    }
  } catch(e){}

  try {
    let catatan = "";
    try { if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); } catch(e){}
    let chatTerakhir = "";
    try { if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); } catch(e){}
    let ringkasan = "";
    try { if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); } catch(e){}

    // BERSIH: baca perintah dari telinga
    let konteksPerintah = "";
    try { if(typeof window.dapatKonteksMavix === "function") konteksPerintah = window.dapatKonteksMavix(); } catch(e){}

    let pesanLengkap = "";
    if (konteksPerintah) pesanLengkap += konteksPerintah + "\n\n";
    if (catatan) pesanLengkap += catatan + "\n\n";
    if (ringkasan) pesanLengkap += ringkasan + "\n\n";
    if (chatTerakhir) pesanLengkap += "CHAT TERAKHIR (4 chat penting, biar kamu boleh sambung kalau Bos bilang lanjutkan):\n" + chatTerakhir + "\n\n";
    pesanLengkap += "Pertanyaan Bos: " + teks;
    let modeKirim = (typeof window.modeMavix !== 'undefined' && window.modeMavix) ? window.modeMavix : "NGOBROL";

    const res = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: pesanLengkap, mode: modeKirim }) });
    const data = await res.json();
    const jawab = data.reply || 'Bos, saya tidak dapat jawab tadi!';
    tambah('mavix', jawab);
    try { if(typeof simpanChat === 'function') simpanChat("assistant", jawab); } catch(e){}
    if (typeof bicara === 'function') bicara(jawab);
  } catch(e){
    tambah('mavix', 'Bos, server saya lagi tidur: ' + e.message);
  }
}

document.addEventListener('DOMContentLoaded', function(){
  const kirimBtn = document.getElementById('kirimBtn');
  if(kirimBtn) kirimBtn.addEventListener('click', kirim);
});
window.kirim = kirim;

// KEMBAR UNTUK SUARA - tanpa tambah(), paksa NGOBROL
async function kirimPesanSuara(teks){
  if(!teks) return;
  teks = teks.trim();
  if(!teks) return;
  try { if(typeof ingatOtomatis === 'function') ingatOtomatis(teks); } catch(e){}
  try { if(typeof simpanChat === 'function') simpanChat("user", teks); } catch(e){}

  try {
    if (typeof OtakKecil !== 'undefined' && typeof OtakKecil.fikirKecil === 'function') {
      let jawabKecil = OtakKecil.fikirKecil(teks);
      if (jawabKecil && jawabKecil.trim() !== '') {
        if (jawabKecil === "__STOP__") {
          if (typeof stopMulut === 'function') stopMulut();
          if (typeof bicara === 'function') bicara("Oke Bos, saya diam dulu.");
          try { if(typeof simpanChat === 'function') simpanChat("assistant", "Oke Bos, saya diam dulu."); } catch(e){}
          return;
        }
        try { if(typeof simpanChat === 'function') simpanChat("assistant", jawabKecil); } catch(e){}
        if (typeof bicara === 'function') bicara(jawabKecil);
        return;
      }
    }
  } catch(e){}

  try {
    if (typeof OtakTengah !== 'undefined' && OtakTengah.fikir) {
      const jawabTengah = await OtakTengah.fikir(teks);
      if(jawabTengah && jawabTengah.trim() !== ''){
        try { if(typeof simpanChat === 'function') simpanChat("assistant", jawabTengah); } catch(e){}
        if (typeof bicara === 'function') bicara(jawabTengah);
        return;
      }
    }
  } catch(e){}

  try {
    let catatan = "";
    try { if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); } catch(e){}
    let chatTerakhir = "";
    try { if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); } catch(e){}
    let ringkasan = "";
    try { if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); } catch(e){}

    // BERSIH: baca perintah dari telinga
    let konteksPerintah = "";
    try { if(typeof window.dapatKonteksMavix === "function") konteksPerintah = window.dapatKonteksMavix(); } catch(e){}

    let pesanLengkap = "";
    if (konteksPerintah) pesanLengkap += konteksPerintah + "\n\n";
    if (catatan) pesanLengkap += catatan + "\n\n";
    if (ringkasan) pesanLengkap += ringkasan + "\n\n";
    if (chatTerakhir) pesanLengkap += "CHAT TERAKHIR (4 chat penting, biar kamu boleh sambung kalau Bos bilang lanjutkan):\n" + chatTerakhir + "\n\n";
    pesanLengkap += "Pertanyaan Bos: " + teks;
    let modeKirim = "NGOBROL";

    const res = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: pesanLengkap, mode: modeKirim }) });
    const data = await res.json();
    const jawab = data.reply || 'Bos, saya tidak dapat jawab tadi!';
    try { if(typeof simpanChat === 'function') simpanChat("assistant", jawab); } catch(e){}
    if (typeof bicara === 'function') bicara(jawab);
  } catch(e){
    if (typeof bicara === 'function') bicara('Bos, server saya lagi tidur: ' + e.message);
  }
}
window.kirimPesanSuara = kirimPesanSuara;
