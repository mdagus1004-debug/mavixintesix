// OTAK DEPAN MAVIX V2.3 - MANAJER PUSAT - VERSI LENGKAP
// Tugas file ini:
// 1. Terima teks dari Bos (dari ketik atau dari suara)
// 2. Cek Otak Kecil dulu
// 3. Kalau kosong, cek Otak Tengah (Wikipedia)
// 4. Kalau kosong juga, baru panggil Otak Besar (Groq di server.js)
// 5. Jangan kirim 2 kali, jangan jawab dobel

window.MAVIX = window.MAVIX || {};

// --- 1. MANAJER STATUS ---
// Mencegah suara dan mic jalan bersamaan, mencegah kirim dobel
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

  // Dipanggil waktu Mavix mulai ngomong, mic harus berhenti
  mulaiNgomong(){
    this.sedangNgomong = true;
    this.sedangDengar = false;
    if(window.hentikanDengar) window.hentikanDengar(true);
  },

  selesaiNgomong(){
    this.sedangNgomong = false;
  },

  // Dipanggil waktu mic mau mulai
  // Kalau Mavix sedang ngomong, mic tidak boleh mulai
  mulaiDengar(){
    if(this.sedangNgomong) return false;
    this.sedangDengar = true;
    return true;
  },

  selesaiDengar(){
    this.sedangDengar = false;
  }
};

window.MAVIX.sedangNgomong = false;

// --- 2. FUNGSI KIRIM UTAMA ---
async function kirim(teksDariSuara){
  // Cegah kirim dobel kalau Bos tekan Enter 2 kali cepat
  if(window.MAVIX.manajer.sedangKirim) return;

  const inputEl = document.getElementById('input');
  let teks = (teksDariSuara || (inputEl ? inputEl.value : "") || "").trim();
  if(!teks) return;

  window.MAVIX.manajer.sedangKirim = true;

  try{
    // Kosongkan kotak ketik
    if(inputEl) inputEl.value = "";

    // Tampilkan chat Bos
    if(window.tambah) window.tambah("user", teks);

    // Simpan ke ingatan
    if(window.simpanChat) window.simpanChat("user", teks);

    // Catat otomatis: nama, suka, hobi, dll
    if(window.ingatOtomatis) window.ingatOtomatis(teks);

    // --- LANGKAH A: CEK OTAK KECIL ---
    let jawabanKecil = "";
    try{ jawabanKecil = window.otakKecil ? window.otakKecil(teks) : ""; }catch(e){ jawabanKecil = ""; }

    if(jawabanKecil){
      // Kalau jawabannya STOP, Mavix diam
      if(jawabanKecil === "STOP"){
        if(window.stopMulut) window.stopMulut();
        if(window.tambah) window.tambah("mavix", "Baik Bos, saya diam.");
        return;
      }
      // Kalau jawabannya JAM
      if(jawabanKecil.startsWith("JAM:")){
        let j = "Sekarang jam " + jawabanKecil.slice(4) + " Bos.";
        if(window.tambah) window.tambah("mavix", j);
        if(window.simpanChat) window.simpanChat("mavix", j);
        if(window.bicara) window.bicara(j);
        return;
      }
      // Kalau jawabannya TANGGAL
      if(jawabanKecil.startsWith("TANGGAL:")){
        let j = "Sekarang " + jawabanKecil.slice(8) + " Bos.";
        if(window.tambah) window.tambah("mavix", j);
        if(window.simpanChat) window.simpanChat("mavix", j);
        if(window.bicara) window.bicara(j);
        return;
      }
      // Kalau jawaban biasa dari Otak Kecil
      if(window.tambah) window.tambah("mavix", jawabanKecil);
      if(window.simpanChat) window.simpanChat("mavix", jawabanKecil);
      if(window.bicara) window.bicara(jawabanKecil);
      return;
    }

    // --- LANGKAH B: CEK OTAK TENGAH (WIKIPEDIA) ---
    let jawabanTengah = "";
    try{ jawabanTengah = window.otakTengah ? await window.otakTengah(teks) : ""; }catch(e){ jawabanTengah = ""; }

    if(jawabanTengah){
      if(window.tambah) window.tambah("mavix", jawabanTengah);
      if(window.simpanChat) window.simpanChat("mavix", jawabanTengah);
      if(window.bicara) window.bicara(jawabanTengah);
      return;
    }

    // --- LANGKAH C: PANGGIL OTAK BESAR (GROQ DI SERVER.JS) ---
    // Siapkan data untuk Groq
    let namaBos = "";
    let kesukaan = "";
    let perasaan = "";
    let catatan = "";
    let chatTerakhir = "";
    try{ namaBos = window.ambilCatatan ? window.ambilCatatan("nama") : ""; }catch(e){}
    try{ kesukaan = window.ambilCatatan ? (window.ambilCatatan("suka") + " " + window.ambilCatatan("makanan") + " " + window.ambilCatatan("minuman")) : ""; }catch(e){}
    try{ perasaan = window.ambilCatatan ? window.ambilCatatan("perasaan") : ""; }catch(e){}
    try{ catatan = window.buatCatatanUntukOtakBesar ? window.buatCatatanUntukOtakBesar() : ""; }catch(e){}
    try{ chatTerakhir = window.ambilChatTerakhir ? window.ambilChatTerakhir(6) : ""; }catch(e){}

    // Gabung semua jadi satu pesan untuk Groq
    // Ini yang dipakai aturan LANJUTKAN di server.js
    let pesanLengkap = catatan + "\nCHAT TERAKHIR:\n" + chatTerakhir + "\nBos: " + teks;

    let jawaban = "";
    // Coba 2 kali, kalau gagal pertama, coba lagi sekali
    for(let coba = 0; coba < 2; coba++){
      try{
        const r = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: pesanLengkap,
            mode: window.modeMavix || "NGOBROL",
            namaBos: namaBos || "Bos",
            kesukaan: kesukaan.trim(),
            perasaan: perasaan
          })
        });
        const d = await r.json();
        jawaban = d.reply || "";
        if(jawaban) break;
      }catch(e){
        if(coba === 1){
          jawaban = "Bos, server saya sedang tidur sebentar, coba lagi ya Bos.";
        } else {
          // Tunggu 800 mili detik, lalu coba lagi
          await new Promise(r => setTimeout(r, 800));
        }
      }
    }

    if(window.tambah) window.tambah("mavix", jawaban);
    if(window.simpanChat) window.simpanChat("mavix", jawaban);
    if(window.bicara) window.bicara(jawaban);

  }finally{
    // Buka kunci kirim, supaya Bos bisa kirim lagi
    window.MAVIX.manajer.sedangKirim = false;
  }
}

window.kirim = kirim;
window.kirimPesanSuara = kirim;

// --- 3. PASANG TOMBOL KIRIM DAN ENTER ---
// Dipasang 1 kali saja, tidak boleh dobel
function pasangKirimBtn(){
  const b = document.getElementById('kirimBtn');
  if(b && !b.dataset.mavixPasang){
    b.dataset.mavixPasang = "1";
    b.addEventListener('click', () => kirim());
  }
  const inputEl = document.getElementById('input');
  if(inputEl && !inputEl.dataset.mavixPasang){
    inputEl.dataset.mavixPasang = "1";
    inputEl.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        kirim();
      }
    });
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', pasangKirimBtn);
} else {
  pasangKirimBtn();
}

window.pasangKirimBtn = pasangKirimBtn;
