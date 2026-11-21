// OTAK KECIL MAVIX V2 - YANG MIKIR, TIDAK SIMPAN SENDIRI
// Semua simpan pinjam ke otak-ingatan.js

const OtakKecil = {
  deposit: 0,
  hargaBarang: 2000,
  riwayatChat: [],
  daftarHarga: { "robot": 2000, "lampu": 50, "baterai": 100, "kopi": 20, "charger": 80 },

  // Helper: ambil dari Lemari
  getNama: function() { return (typeof ambilIngatan === "function") ? ambilIngatan("nama") : ""; },
  getSuka: function() { return (typeof ambilIngatan === "function") ? ambilIngatan("suka") : ""; },
  getPerasaan: function() { return (typeof ambilIngatan === "function") ? ambilIngatan("perasaan") : ""; },

  simpanChat: function(teksBos, jawabanSaya) {
    this.riwayatChat.push({ bos: teksBos, saya: jawabanSaya, waktu: new Date().toLocaleTimeString('id-ID') });
    if (this.riwayatChat.length > 20) this.riwayatChat.shift();
  },

  fikirKecil: function(teks) {
    let t = teks.toLowerCase().trim();
    let panggil = this.getNama() || "Bos";

    if (t.includes('stop') || t.includes('berhenti') || t.includes('diam')) {
      if (typeof stopMulut === 'function') stopMulut();
      return "Siap Bos, saya berhenti.";
    }
    if (t === 'halo' || t === 'hai' || t.includes('halo mavix')) {
      let suka = this.getSuka();
      if (suka) return "Halo " + panggil + ", apa kabar? Bos mau " + suka + " lagi?";
      return "Halo " + panggil + ", apa kabar? Saya kangen Bos nih.";
    }
    if (t.includes('jam berapa') || t.includes('pukul berapa')) {
      return "Sekarang jam " + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " Bos.";
    }
    if (t.includes('tanggal') || t.includes('hari ini')) {
      return "Hari ini " + new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + " Bos.";
    }
    if (t.includes('terima kasih') || t.includes('makasih')) return "Sama-sama Bos, senang bisa bantu.";

    // --- INI YANG PINJAM KE LEMARI ---
    if (t.includes("nama saya")) {
      let nama = teks.replace(/nama saya/i, "").replace(/adalah/i, "").trim();
      if (nama) { ingat(nama, "nama"); return "Oke, saya sudah ingat. Nama Bos " + nama + "."; }
    }
    if (t.includes("siapa nama saya")) {
      let nama = this.getNama();
      if (nama) return "Nama Bos " + nama + ", saya masih ingat.";
      return "Saya belum tahu nama Bos. Bos namanya siapa?";
    }
    if (t.includes("saya suka")) {
      let suka = teks.replace(/saya suka/i, "").trim();
      ingat(suka, "suka");
      return "Oh Bos suka " + suka + " ya? Oke saya ingat.";
    }
    if (t.includes("saya sedih") || t.includes("saya galau")) {
      ingat("sedih", "perasaan");
      return "Eh kenapa Bos sedih? Cerita dong, saya dengar.";
    }
    if (t.includes("saya senang")) {
      ingat("senang", "perasaan");
      return "Wahh Bos senang! Saya ikut senang nih! Kenapa Bos senang?";
    }
    if (t.includes("apa yang kamu ingat")) {
      return apaYangSayaIngat();
    }
    if (t.includes("lupakan saya") || t.includes("lupa semua")) {
      return lupaSemua();
    }
    if (t.includes("saya capek")) {
      ingat("capek", "perasaan");
      return "Waduh Bos capek ya? Istirahat dulu Bos.";
    }

    // Hitung tetap di sini, karena ini mikir, bukan ingatan
    if (t.includes("deposit")) {
      let angka = teks.match(/\d+/);
      if (angka) { this.deposit = parseInt(angka[0]); ingat(this.deposit + "", "deposit"); return "Oke deposit " + this.deposit + " sudah saya simpan."; }
      return "Depositnya berapa Bos?";
    }
    if (t.includes("sisa")) {
      return "Harga " + this.hargaBarang + ", deposit Bos " + this.deposit + ". Sisanya tinggal " + (this.hargaBarang - this.deposit) + ".";
    }
    return null;
  },

  async fikir(teks, bagiJawaban) {
    if (typeof stopMulut === 'function') stopMulut();
    let jawabanKecil = this.fikirKecil(teks);
    if (jawabanKecil) { this.simpanChat(teks, jawabanKecil); bagiJawaban(jawabanKecil); return; }

    // Kalau Otak Kecil tidak tahu, lempar ke Otak Tengah / Besar
    try {
      let tengah = await otakTengah(teks);
      if (tengah) { this.simpanChat(teks, tengah); bagiJawaban(tengah); return; }
    } catch(e) {}
    try {
      let res = await fetch("/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: teks, namaBos: this.getNama(), kesukaan: this.getSuka(), perasaan: this.getPerasaan() })
      });
      let data = await res.json();
      let jawaban = data.reply || "Bos, saya tidak dapat jawab tadi!";
      this.simpanChat(teks, jawaban); bagiJawaban(jawaban);
    } catch(e) {
      let jawabanBackup = "Bos, Groq saya putus sebentar. Tapi saya masih di sini.";
      this.simpanChat(teks, jawabanBackup); bagiJawaban(jawabanBackup);
    }
  }
};
