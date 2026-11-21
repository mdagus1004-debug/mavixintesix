// OTAK KECIL MAVIX V3 - DIET, HANYA MIKIR GAMPANG
// Tidak boleh panggil Otak Tengah, tidak boleh panggil Groq.
// Kalau tidak tahu, jawab null saja, biar Otak Depan yang urus.

const OtakKecil = {
  deposit: 0,
  hargaBarang: 2000,
  riwayatChat: [],
  daftarHarga: { "robot": 2000, "lampu": 50, "baterai": 100, "kopi": 20, "charger": 80 },

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
    if (t.includes("deposit")) {
      let angka = teks.match(/\d+/);
      if (angka) { this.deposit = parseInt(angka[0]); ingat(this.deposit + "", "deposit"); return "Oke deposit " + this.deposit + " sudah saya simpan."; }
      return "Depositnya berapa Bos?";
    }
    if (t.includes("sisa")) {
      return "Harga " + this.hargaBarang + ", deposit Bos " + this.deposit + ". Sisanya tinggal " + (this.hargaBarang - this.deposit) + ".";
    }
    return null;
  }
};
