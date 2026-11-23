// mulut.js - VERSI TERAKHIR IKUT BOS + JEDA PINTAR
// 1 = 2 detik, Bos diam 2 detik, baru proses (ada di telinga.js)
// 2 = Mavix jangan diam masa otak mikir, terus ngomong teks lama, sudah dapat jawaban baru potong
// 3 = TAK PAKAI, SUDAH BUANG
// TAMBAHAN BARU = Jeda pintar di akhir kalimat, baru buka telinga. Kalau dengar suara sendiri, HAPUS.

let suaraTerpilih = null;

window.MAVIX = window.MAVIX || {};
window.MAVIX.sedangNgomong = false;
window.MAVIX.kalimatSekarang = "";
window.MAVIX.teksMavixTerakhir = "";
window.MAVIX.waktuMavixNgomongTerakhir = 0;
window.MAVIX.micNyala = window.MAVIX.micNyala || false;
window.MAVIX.recognition = window.MAVIX.recognition || null;
window.MAVIX.tampungPesan = "";
window.MAVIX.adaTampung = false;
window.MAVIX.antrianTerakhir = "";
window.MAVIX.waktuBosMulaiNgomong = 0;
window.MAVIX.idBicara = window.MAVIX.idBicara || 0; // Untuk potong yang lama

function siapkanSuara(){
  const list = window.speechSynthesis.getVoices();
  suaraTerpilih = list.find(v => v.lang === "id-ID") || list.find(v => v.lang.startsWith("id")) || list[0];
}
window.speechSynthesis.onvoiceschanged = siapkanSuara;
siapkanSuara();

function bicara(teks){
  // PERATURAN 2 BOS: Bila jawaban SUDAH dapat, barulah potong teks lama, timpa dengan jawaban baru
  // Sebelum bicara() dipanggil, Mavix terus ngomong teks lama, dia tidak diam
  // Jadi di sini, kita potong dulu yang lama, baru ngomong yang baru
  try{ window.speechSynthesis.cancel(); }catch(e){}

  // Naikkan ID. Ini supaya kalimat lama yang masih antri, tahu dia sudah kena potong, dia berhenti sendiri.
  window.MAVIX.idBicara++;
  let idSaya = window.MAVIX.idBicara;

  // 1. Pecah teks panjang jadi kalimat-kalimat kecil. Pecah di titik, seru, tanya.
  let daftarKalimat = teks.match(/[^.!?]+[.!?]+/g);
  if(!daftarKalimat) daftarKalimat = [teks];

  let index = 0;

  function ngomongSatuKalimat(){
    // Kalau sudah kena potong sama jawaban baru, berhenti. Jangan lanjut.
    if(idSaya !== window.MAVIX.idBicara) return;
    if(index >= daftarKalimat.length){
      // Semua kalimat sudah habis, baru buka telinga penuh
      window.MAVIX.sedangNgomong = false;
      window.MAVIX.kalimatSekarang = "";
      setStatusMulut("Lagi dengerin Bos...");
      hidupkanMicLagi();
      return;
    }

    let satuKalimat = daftarKalimat[index].trim();
    index++;

    // 2. TUTUP TELINGA waktu ngomong satu kalimat ini
    window.MAVIX.sedangNgomong = true;
    window.MAVIX.kalimatSekarang = satuKalimat;
    // Simpan kalimat ini, supaya telinga kenal kalau ini suara sendiri, nanti dia HAPUS
    window.MAVIX.teksMavixTerakhir = satuKalimat;
    window.MAVIX.waktuMavixNgomongTerakhir = Date.now();
    setStatusMulut("Mavix ngomong: " + satuKalimat);

    // Matikan mic dulu, biar tidak dengar suara sendiri di tengah kalimat
    if(window.MAVIX.recognition && window.MAVIX.micNyala){
      try{ window.MAVIX.recognition.stop(); }catch(e){}
    }

    // 3. Tunggu 300ms, baru ngomong. Biar mic betul-betul mati dulu.
    setTimeout(function(){
      if(idSaya !== window.MAVIX.idBicara) return; // Sudah kena potong, jangan ngomong

      const ucapan = new SpeechSynthesisUtterance(satuKalimat);
      ucapan.lang = "id-ID"; ucapan.rate = 1.0; ucapan.pitch = 1.0;
      if(suaraTerpilih) ucapan.voice = suaraTerpilih;

      ucapan.onend = function(){
        if(idSaya !== window.MAVIX.idBicara) return; // Sudah kena potong

        // 4. INI JEDA PINTAR - AKHIR KALIMAT
        // Satu kalimat sudah habis. Buka telinga sebentar, 600ms saja.
        window.MAVIX.sedangNgomong = false;
        window.MAVIX.kalimatSekarang = "";
        setStatusMulut("Jeda... buka telinga sebentar, cek Bos mau nyela tak...");

        // Buka telinga
        if(window.MAVIX.recognition && window.MAVIX.micNyala){
          try{ window.MAVIX.recognition.start(); }catch(e){}
        }

        // Tunggu 600ms di jeda ini
        setTimeout(function(){
          if(idSaya !== window.MAVIX.idBicara) return; // Sudah kena potong sama jawaban baru
          // Kalau Bos tidak nyela dalam 600ms, tutup telinga lagi, lanjut kalimat seterusnya
          // Kalau Bos nyela, telinga akan proses, dan bicara() baru akan dipanggil, idBicara akan naik, yang lama ini akan berhenti sendiri di atas
          window.MAVIX.sedangNgomong = true;
          if(window.MAVIX.recognition && window.MAVIX.micNyala){
            try{ window.MAVIX.recognition.stop(); }catch(e){}
          }
          ngomongSatuKalimat();
        }, 600);
      };

      ucapan.onerror = function(){
        if(idSaya !== window.MAVIX.idBicara) return;
        window.MAVIX.sedangNgomong = false;
        window.MAVIX.kalimatSekarang = "";
        hidupkanMicLagi();
      };

      window.speechSynthesis.speak(ucapan);
    }, 300);
  }

  ngomongSatuKalimat();
}

function hentikanMavixKarenaBosNgomong(){
  // Ini juga potong. Bila Bos ngomong, potong teks lama.
  window.MAVIX.idBicara++; // Naikkan ID, supaya antrian kalimat lama berhenti
  try{ window.speechSynthesis.cancel(); }catch(e){}
  window.MAVIX.sedangNgomong = false;
  window.MAVIX.kalimatSekarang = "";
  setStatusMulut("Sudah dapat jawaban, potong teks lama...");
  hidupkanMicLagi();
}

function setStatusMulut(teks){
  const s = document.getElementById("status");
  if(s) s.innerText = teks;
}
function hidupkanMicLagi(){
  // Kasih jeda 500ms, biar ekor suara habis dulu, baru buka telinga
  setTimeout(function(){
    if(window.MAVIX.recognition && window.MAVIX.micNyala){
      try{ window.MAVIX.recognition.start(); }catch(e){}
    }
  }, 500);
}

window.bicara = bicara;
window.stopMulut = hentikanMavixKarenaBosNgomong;
window.potongMavix = hentikanMavixKarenaBosNgomong;
window.hentikanMavixKarenaBosNgomong = hentikanMavixKarenaBosNgomong;
