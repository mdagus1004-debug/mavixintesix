// ===== OTAK DEPAN - MANAJER MAVIX =====
// Tugasnya: terima chat Bos, tentukan siapa yang jawab, tampilkan.

async function kirim(){
  const inp = document.getElementById('input');
  if(!inp) return;
  const teks = inp.value.trim();
  if(!teks) return;

  // 1. Tampilkan chat Bos. Ingat: tambah(siapa, teks) - siapa dulu!
  tambah('user', teks);
  inp.value = '';
  inp.focus();

  // 2. Simpan ke ingatan kalau ada
  try { if(typeof simpanIngatan === 'function') simpanIngatan('user', teks); } catch(e){}

  // 3. Coba OTAK KECIL dulu - untuk halo, siapa kamu, dll. Cepat.
  // Kalau Otak Kecil bisa jawab, dia yang jawab, berhenti di sini.
  try {
    if (typeof OtakKecil !== 'undefined' && OtakKecil.fikir) {
      let sudahDijawab = false;
      // OtakKecil.fikir pakai callback di file Bos
      OtakKecil.fikir(teks, function(jawab){
        if(jawab && jawab.trim() !== ''){
          sudahDijawab = true;
          tambah('mavix', jawab);
          cakap(jawab);
        }
      });
      // Kasih waktu sebentar buat Otak Kecil mikir. Kalau dia jawab, kita berhenti.
      await new Promise(r => setTimeout(r, 50));
      if(sudahDijawab) return;
    }
  } catch(e){}

  // 4. Kalau Otak Kecil tidak bisa, coba OTAK TENGAH - untuk apa itu robot, wikipedia, dll.
  try {
    if (typeof OtakTengah !== 'undefined' && OtakTengah.fikir) {
      const jawabTengah = await OtakTengah.fikir(teks);
      if(jawabTengah && jawabTengah.trim() !== ''){
        tambah('mavix', jawabTengah);
        cakap(jawabTengah);
        return;
      }
    }
    // Kalau OtakTengah pakai nama lain, misal cariWikipedia
    if (typeof OtakTengah !== 'undefined' && OtakTengah.cariWikipedia) {
      const jawabTengah2 = await OtakTengah.cariWikipedia(teks);
      if(jawabTengah2 && jawabTengah2.trim() !== ''){
        tambah('mavix', jawabTengah2);
        cakap(jawabTengah2);
        return;
      }
    }
  } catch(e){}

  // 5. Kalau dua-duanya tidak bisa, baru ke OTAK BESAR (server / Groq)
  try {
    const res = await fetch('/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: teks }) });
    const data = await res.json();
    const jawab = data.reply || 'Bos, saya tidak dapat jawab tadi!';
    tambah('mavix', jawab);
    cakap(jawab);
  } catch(e){
    tambah('mavix', 'Bos, server saya lagi tidur: ' + e.message);
  }
}

// ===== SAMBUNG TOMBOL - SESUAI ID DI index.html BOS =====
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
