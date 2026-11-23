// OTAK DEPAN - MANAJER MAVIX - TANPA LAMBAI
// File asli Bos, tidak saya ubah sama sekali di bagian kirim(). Saya hanya tambah kirimPesanSuara() di bawah.

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

  // --- OTAK KECIL ---
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

  // --- OTAK TENGAH ---
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

  // --- OTAK BESAR (GROQ) ---
  try {
    let catatan = "";
    try { if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); } catch(e){}
    let chatTerakhir = "";
    try { if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); } catch(e){}
    let ringkasan = "";
    try { if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); } catch(e){}

    let pesanLengkap = "";
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
  const inputEl = document.getElementById('input');
  if(inputEl) inputEl.addEventListener('keypress', function(e){ if(e.key === 'Enter') kirim(); });
});
window.kirim = kirim;

// ============================================================
// TAMBAHAN BARU - KENAPA DITAMBAH?
// Karena fungsi kirim() yang lama selalu panggil tambah() untuk tampilkan teks.
// Di layar suara, kita tidak boleh tampilkan teks, kita hanya boleh bicara.
// Jadi kita buat fungsi kembar, isinya sama persis, tapi tanpa tambah().
// ============================================================
async function kirimPesanSuara(teks){
  if(!teks) return;
  teks = teks.trim();
  if(!teks) return;

  // Tetap ingat dan simpan, supaya kalau balik ke chat, Mavix tidak lupa
  try { if(typeof ingatOtomatis === 'function') ingatOtomatis(teks); } catch(e){}
  try { if(typeof simpanChat === 'function') simpanChat("user", teks); } catch(e){}

  // OTAK KECIL - sama seperti kirim(), tapi tanpa tambah()
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

  // OTAK TENGAH - sama seperti kirim(), tapi tanpa tambah()
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

  // OTAK BESAR - sama seperti kirim(), tapi dipaksa NGOBROL dan tanpa tambah()
  // KENAPA DIPAKSA NGOBROL? Karena di mode BACA jawaban pendek, tidak enak didengar. Di layar suara, jawaban harus panjang seperti ngobrol.
  try {
    let catatan = "";
    try { if(typeof buatCatatanUntukOtakBesar === 'function') catatan = buatCatatanUntukOtakBesar(); } catch(e){}
    let chatTerakhir = "";
    try { if(typeof ambilChatTerakhir === 'function') chatTerakhir = ambilChatTerakhir(4); } catch(e){}
    let ringkasan = "";
    try { if(typeof buatRingkasanArsip === 'function') ringkasan = buatRingkasanArsip(); } catch(e){}

    let pesanLengkap = "";
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
