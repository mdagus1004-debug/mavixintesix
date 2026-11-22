// OTAK DEPAN - MANAJER MAVIX V2.3 - KIRIM RINGKASAN ARSIP, BUKAN ARSIP MENTAH
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
        tambah('mavix', jawabKecil);
        try { if(typeof simpanChat === 'function') simpanChat("assistant", jawabKecil); } catch(e){}
        cakap(jawabKecil);
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
        cakap(jawabTengah);
        return;
      }
    }
  } catch(e){}

  try {
    let catatan = "";
    try { if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); } catch(e){}
    let chatTerakhir = "";
    try { if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); } catch(e){}

    // ===== BARU V2.3 - AMBIL RINGKASAN 1 BARIS DARI ARSIP, BUKAN ARSIP MENTAH =====
    let ringkasan = "";
    try { if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); } catch(e){}

    let pesanLengkap = "";
    if (catatan) pesanLengkap += catatan + "\n\n";
    if (ringkasan) pesanLengkap += ringkasan + "\n\n"; // <-- Cuma 1 baris, ~30 token, bukan 2500 token
    if (chatTerakhir) pesanLengkap += "CHAT TERAKHIR (4 chat penting, biar kamu boleh sambung kalau Bos cakap lanjutkan):\n" + chatTerakhir + "\n\n";
    pesanLengkap += "Pertanyaan Bos: " + teks;
    let modeKirim = (typeof window.modeMavix !== 'undefined' && window.modeMavix) ? window.modeMavix : "NGOBROL";
    const res = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: pesanLengkap, mode: modeKirim }) });
    const data = await res.json();
    const jawab = data.reply || 'Bos, saya tidak dapat jawab tadi!';
    tambah('mavix', jawab);
    try { if(typeof simpanChat === 'function') simpanChat("assistant", jawab); } catch(e){}
    cakap(jawab);
  } catch(e){
    tambah('mavix', 'Bos, server saya lagi tidur: ' + e.message);
  }
}
document.addEventListener('DOMContentLoaded', function(){
  const kirimBtn = document.getElementById('kirimBtn');
  if(kirimBtn) kirimBtn.addEventListener('click', kirim);
  const lambaiBtn = document.getElementById('lambaiBtn');
  if(lambaiBtn) lambaiBtn.addEventListener('click', lambai);
  const avatarBtn = document.getElementById('avatarBtn');
  if(avatarBtn) avatarBtn.addEventListener('click', lambai);
  const inputEl = document.getElementById('input');
  if(inputEl) inputEl.addEventListener('keypress', function(e){ if(e.key === 'Enter') kirim(); });
});
window.kirim = kirim;
