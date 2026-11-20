// OTAK KECIL MAVIX V4 - Bahasa Indonesia
// 1: Ingatan Kekal, 2: Hitung Toko, 3: Percakapan, 4: Perintah Beneran
// SUDAH NYAMBUNG KE mulut.js (bicara / stopMulut) DAN index.html (badan)

const OtakKecil = {
  namaBos: "", deposit: 0, hargaBarang: 2000,
  riwayatChat: [], topikTerakhir: "",
  kesukaanBos: "", tidakSukaBos: "", perasaanBos: "",
  catatanBos: [], pengingatBos: [],
  daftarHarga: { "robot": 2000, "lampu": 50, "baterai": 100, "kopi": 20, "charger": 80 },

  // ===== INGATAN - SIMPAN DI BUKU (localStorage) =====
  simpanKeBuku: function() {
    let dataIngatan = {
      namaBos: this.namaBos, deposit: this.deposit,
      kesukaanBos: this.kesukaanBos, tidakSukaBos: this.tidakSukaBos,
      riwayatChat: this.riwayatChat, topikTerakhir: this.topikTerakhir,
      perasaanBos: this.perasaanBos,
      catatanBos: this.catatanBos, pengingatBos: this.pengingatBos
    };
    localStorage.setItem("ingatan_mavix", JSON.stringify(dataIngatan));
  },
  bacaDariBuku: function() {
    let data = localStorage.getItem("ingatan_mavix");
    if (!data) return false;
    let ingatan = JSON.parse(data);
    this.namaBos = ingatan.namaBos || "";
    this.deposit = ingatan.deposit || 0;
    this.kesukaanBos = ingatan.kesukaanBos || "";
    this.tidakSukaBos = ingatan.tidakSukaBos || "";
    this.riwayatChat = ingatan.riwayatChat || [];
    this.topikTerakhir = ingatan.topikTerakhir || "";
    this.perasaanBos = ingatan.perasaanBos || "";
    this.catatanBos = ingatan.catatanBos || [];
    this.pengingatBos = ingatan.pengingatBos || [];
    return true;
  },
  lupakanSemua: function() {
    localStorage.removeItem("ingatan_mavix");
    this.namaBos = ""; this.deposit = 0; this.kesukaanBos = ""; this.tidakSukaBos = "";
    this.riwayatChat = []; this.topikTerakhir = ""; this.perasaanBos = "";
    this.catatanBos = []; this.pengingatBos = [];
    return "Oke Bos, semua sudah saya lupakan. Kita kenalan dari awal lagi ya.";
  },
  simpanChat: function(teksBos, jawabanSaya) {
    this.riwayatChat.push({ bos: teksBos, saya: jawabanSaya, waktu: new Date().toLocaleTimeString('id-ID') });
    if (this.riwayatChat.length > 100) this.riwayatChat.shift();
    this.topikTerakhir = teksBos;
    this.simpanKeBuku();
  },

  // ===== HITUNG TOKO =====
  hitungDiskon: function(teks) {
    let t = teks.toLowerCase();
    if (!t.includes("diskon") && !t.includes("%")) return null;
    let angka = teks.match(/\d+/g);
    if (!angka || angka.length < 2) return null;
    let harga, persen;
    if (t.indexOf("diskon") < t.indexOf(angka[0])) { persen = parseInt(angka[0]); harga = parseInt(angka[1]); }
    else { harga = parseInt(angka[0]); persen = parseInt(angka[1]); }
    let potongan = harga * persen / 100;
    return "Harga awal " + harga + ", diskon " + persen + "% = potongan " + potongan + ". Jadi Bos bayar " + (harga - potongan) + " saja. Bos hemat " + potongan + ".";
  },
  hitungOngkir: function(teks) {
    let t = teks.toLowerCase();
    if (!t.includes("ongkir")) return null;
    let angka = teks.match(/\d+/g);
    if (!angka || angka.length < 2) return "Ongkirnya berapa Bos? Coba bilang 'Total 2000 ongkir 50'.";
    return "Total barang " + angka[0] + " + ongkir " + angka[1] + " = " + (parseInt(angka[0]) + parseInt(angka[1])) + ".";
  },
  hitungCicilan: function(teks) {
    let t = teks.toLowerCase();
    if (!(t.includes("cicil") || (t.includes("bayar") && (t.includes("kali") || t.includes("bulan"))))) return null;
    let angka = teks.match(/\d+/g);
    if (!angka || angka.length < 2) return null;
    let harga = parseInt(angka[0]); let berapaKali = parseInt(angka[1]);
    return "Harga " + harga + " dibagi " + berapaKali + " kali. Jadi per bulan Bos bayar " + Math.ceil(harga / berapaKali) + ".";
  },
  hitungPintar: function(teks) {
    let t = teks.toLowerCase();
    let diskon = this.hitungDiskon(teks); if (diskon) return diskon;
    let ongkir = this.hitungOngkir(teks); if (ongkir) return ongkir;
    let cicilan = this.hitungCicilan(teks); if (cicilan) return cicilan;
    if (t.includes("beli")) {
      for (let barang in this.daftarHarga) {
        if (t.includes(barang)) {
          let jumlah = teks.match(/\d+/); let qty = jumlah ? parseInt(jumlah[0]) : 1;
          return "Oke Bos, " + qty + " " + barang + " harga " + this.daftarHarga[barang] + ". Totalnya " + (qty * this.daftarHarga[barang]) + ".";
        }
      }
    }
    let angkaSemua = teks.match(/\d+/g);
    if (angkaSemua && angkaSemua.length >= 2) {
      if (t.includes("tambah") || t.includes("+")) {
        let total = angkaSemua.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        return angkaSemua.join(" tambah ") + " = " + total + ".";
      }
      if (t.includes("kurang") || t.includes("-")) {
        let hasil = parseInt(angkaSemua[0]); for (let i = 1; i < angkaSemua.length; i++) hasil -= parseInt(angkaSemua[i]);
        return angkaSemua.join(" kurang ") + " = " + hasil + ".";
      }
      if (t.includes("kali") || t.includes("x")) {
        let hasil = parseInt(angkaSemua[0]); for (let i = 1; i < angkaSemua.length; i++) hasil *= parseInt(angkaSemua[i]);
        return angkaSemua.join(" kali ") + " = " + hasil + ".";
      }
      if (t.includes("bagi") || t.includes("/")) {
        let hasil = parseInt(angkaSemua[0]); for (let i = 1; i < angkaSemua.length; i++) hasil /= parseInt(angkaSemua[i]);
        return angkaSemua.join(" bagi ") + " = " + hasil + ".";
      }
    }
    return null;
  },

  // ===== PERASAAN BOS =====
  cekPerasaan: function(teks) {
    let t = teks.toLowerCase();
    if (t.includes("saya sedih") || t.includes("saya galau") || t.includes("saya stres")) {
      this.perasaanBos = "sedih"; this.simpanKeBuku();
      return "Eh kenapa Bos sedih? Cerita dong, saya dengar. Saya di sini, saya tidak ke mana-mana. Bos sudah makan belum?";
    }
    if (t.includes("saya capek") || t.includes("saya lelah") || t.includes("saya ngantuk")) {
      this.perasaanBos = "capek"; this.simpanKeBuku();
      return "Waduh Bos capek ya? Istirahat dulu Bos, jangan dipaksa. Bos mau saya matikan lampu biar Bos bisa tidur?";
    }
    if (t.includes("saya senang") || t.includes("saya bahagia")) {
      this.perasaanBos = "senang"; this.simpanKeBuku();
      return "Wahh Bos senang! Saya ikut senang nih! Kenapa Bos senang? Cerita dong!";
    }
    if (t.includes("saya marah") || t.includes("saya kesal")) {
      this.perasaanBos = "marah"; this.simpanKeBuku();
      return "Oke Bos, tarik napas dulu ya. Siapa yang bikin Bos marah? Cerita saja, saya dengar.";
    }
    if (t.includes("saya bosan")) {
      this.perasaanBos = "bosan"; this.simpanKeBuku();
      return "Bos bosan ya? Mau saya ceritakan lelucon? Atau Bos mau saya bukakan lagu?";
    }
    if (t.includes("sudah baikan") || t.includes("sudah enakan")) {
      this.perasaanBos = "baik"; this.simpanKeBuku();
      return "Syukurlah Bos sudah enakan! Saya senang dengarnya.";
    }
    return null;
  },

  // ===== PERINTAH BENERAN - NYAMBUNG KE BADAN =====
  perintahLampu: function(teks) {
    let t = teks.toLowerCase();
    if (!t.includes("lampu")) return null;
    let panggil = this.namaBos || "Bos";
    if (t.includes("nyalakan") || t.includes("hidupkan") || t.includes("nyala")) {
      document.body.style.background = "white"; document.body.style.color = "black";
      let pentas = document.querySelector('.pentas');
      if(pentas) pentas.style.background = "radial-gradient(circle at 50% 40%, #e0f2fe 0%, #ffffff 70%)";
      return "Oke " + panggil + ", lampu sudah saya nyalakan beneran! Layar Bos sudah terang.";
    }
    if (t.includes("matikan") || t.includes("tutup") || t.includes("mati")) {
      document.body.style.background = "#111111"; document.body.style.color = "white";
      let pentas = document.querySelector('.pentas');
      if(pentas) pentas.style.background = "radial-gradient(circle at 50% 40%, #0a2a5a 0%, #050818 70%)";
      return "Oke " + panggil + ", lampu sudah saya matikan beneran! Layar Bos sudah gelap.";
    }
    return null;
  },
  perintahBuka: function(teks) {
    let t = teks.toLowerCase();
    let panggil = this.namaBos || "Bos";
    if (t.includes("buka lagu") || t.includes("putar lagu") || t.includes("buka youtube")) {
      window.open("https://www.youtube.com/results?search_query=lagu+tenang", "_blank");
      return "Oke " + panggil + ", sudah saya bukakan YouTube.";
    }
    if (t.includes("buka google")) {
      window.open("https://www.google.com", "_blank");
      return "Oke " + panggil + ", Google sudah saya buka.";
    }
    return null;
  },
  perintahCatatan: function(teks) {
    let t = teks.toLowerCase();
    let panggil = this.namaBos || "Bos";
    if (t.includes("simpan catatan") || t.includes("catat")) {
      let isi = teks.replace(/simpan catatan/i, "").replace(/catat/i, "").replace(/,/g, "").trim();
      if (isi) {
        this.catatanBos.push({ isi: isi, waktu: new Date().toLocaleString('id-ID') });
        this.simpanKeBuku();
        return "Oke " + panggil + ", sudah saya simpan: '" + isi + "'.";
      } else return "Mau simpan catatan apa Bos? Coba bilang 'Simpan catatan, besok beli kopi'.";
    }
    if (t.includes("apa catatan saya") || t.includes("lihat catatan")) {
      if (this.catatanBos.length === 0) return "Bos belum punya catatan.";
      let hasil = "Ini catatan Bos, ada " + this.catatanBos.length + ":\n";
      this.catatanBos.forEach((c, i) => { hasil += (i+1) + ". " + c.isi + "\n"; });
      return hasil;
    }
    if (t.includes("hapus catatan")) {
      this.catatanBos = []; this.simpanKeBuku();
      return "Oke " + panggil + ", semua catatan sudah saya hapus.";
    }
    return null;
  },
  perintahPengingat: function(teks) {
    let t = teks.toLowerCase();
    let panggil = this.namaBos || "Bos";
    if (t.includes("ingatkan saya") || t.includes("ingetin saya")) {
      let isi = teks.replace(/ingatkan saya/i, "").replace(/ingetin saya/i, "").trim();
      let angka = teks.match(/\d+/);
      let detik = 10;
      if (t.includes("detik") && angka) detik = parseInt(angka[0]);
      if (t.includes("menit") && angka) detik = parseInt(angka[0]) * 60;
      if (t.includes("jam") && angka) detik = parseInt(angka[0]) * 3600;
      this.pengingatBos.push({ isi: isi, waktu: new Date().toLocaleString('id-ID') });
      this.simpanKeBuku();
      setTimeout(() => { 
        alert("MAVIX: Bos! " + isi); 
        if(typeof bicara === 'function') bicara("Bos! " + isi);
      }, detik * 1000);
      return "Oke " + panggil + ", saya ingatkan dalam " + detik + " detik lagi: '" + isi + "'.";
    }
    return null;
  },

  // ===== OTAK KECIL BERPIKIR DULU =====
  fikirKecil: function(teks) {
    let t = teks.toLowerCase().trim();
    let panggil = this.namaBos || "Bos";
    let perasaan = this.cekPerasaan(teks); if (perasaan) return perasaan;
    let lampu = this.perintahLampu(teks); if (lampu) return lampu;
    let buka = this.perintahBuka(teks); if (buka) return buka;
    let catatan = this.perintahCatatan(teks); if (catatan) return catatan;
    let ingat = this.perintahPengingat(teks); if (ingat) return ingat;
    if (t.includes("lupakan saya")) return this.lupakanSemua();
    if (t.includes("nama saya")) {
      let nama = teks.replace(/nama saya/i, "").replace(/adalah/i, "").trim();
      if (nama) { this.namaBos = nama; this.simpanKeBuku(); return "Oke, saya sudah ingat. Nama Bos " + this.namaBos + "."; }
    }
    if (t.includes("siapa nama saya")) {
      if (this.namaBos) return "Nama Bos " + this.namaBos + ", saya masih ingat.";
      else return "Saya belum tahu nama Bos. Bos namanya siapa?";
    }
    if (t.includes("saya suka")) {
      let suka = teks.replace(/saya suka/i, "").trim();
      this.kesukaanBos = suka; this.simpanKeBuku();
      return "Oh Bos suka " + suka + " ya? Oke saya ingat.";
    }
    if (t.includes("apa yang kamu ingat")) {
      let ingat = "";
      if (this.namaBos) ingat += "Nama Bos " + this.namaBos + ". ";
      if (this.kesukaanBos) ingat += "Bos suka " + this.kesukaanBos + ". ";
      if (this.deposit) ingat += "Deposit Bos " + this.deposit + ". ";
      if (this.perasaanBos) ingat += "Terakhir Bos perasaan " + this.perasaanBos + ". ";
      if (!ingat) return "Saya belum ingat apa-apa.";
      return "Yang saya ingat: " + ingat;
    }
    if (t.includes("tadi saya bilang apa")) {
      if (this.riwayatChat.length >= 2) return "Tadi Bos bilang: '" + this.riwayatChat[this.riwayatChat.length - 2].bos + "'.";
      else return "Tadi Bos belum bilang apa-apa.";
    }
    if (t === "halo" || t === "hai" || t.includes("halo mavix")) {
      if (this.kesukaanBos) return "Halo " + panggil + ", apa kabar? Bos mau " + this.kesukaanBos + " lagi?";
      return "Halo " + panggil + ", apa kabar? Saya kangen Bos nih.";
    }
    if (t.includes("deposit")) {
      let angka = teks.match(/\d+/);
      if (angka) { this.deposit = parseInt(angka[0]); this.simpanKeBuku(); return "Oke deposit " + this.deposit + " sudah saya simpan."; }
      else return "Depositnya berapa Bos?";
    }
    if (t.includes("sisa")) {
      return "Harga " + this.hargaBarang + ", deposit Bos " + this.deposit + ". Sisanya tinggal " + (this.hargaBarang - this.deposit) + ".";
    }
    if (t.includes("harga")) {
      for (let barang in this.daftarHarga) {
        if (t.includes(barang)) return "Harga " + barang + " sekarang " + this.daftarHarga[barang] + " saja, " + panggil + ". Mau beli?";
      }
      return "Bos mau tanya harga apa? Ada robot, lampu, baterai, kopi, charger.";
    }
    // Perintah mode untuk mulut.js
    if (t.includes("mode kerja")) { if(typeof gantiMode === 'function') gantiMode("KERJA"); return "Siap Bos, mode kerja aktif."; }
    if (t.includes("mode ngobrol")) { if(typeof gantiMode === 'function') gantiMode("NGOBROL"); return "Asik, mode ngobrol aktif Bos."; }
    let hasilHitung = this.hitungPintar(teks);
    if (hasilHitung) return hasilHitung;
    return null;
  },

  // ===== JEMBATAN KE OTAK BESAR =====
  async fikir(teks, bagiJawaban) {
    // Kalau mulut lagi ngomong, hentikan dulu biar tidak berebut
    if(window.sedangBicara && typeof stopMulut === 'function'){
      stopMulut();
    }
    let jawabanKecil = this.fikirKecil(teks);
    if (jawabanKecil) { this.simpanChat(teks, jawabanKecil); bagiJawaban(jawabanKecil); return; }
    try {
      let res = await fetch("/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: teks, namaBos: this.namaBos, kesukaan: this.kesukaanBos, perasaan: this.perasaanBos })
      });
      if (!res.ok) throw new Error("Groq mati");
      let data = await res.json();
      let jawaban = data.reply || data.jawaban;
      if (!jawaban) throw new Error("Groq kosong");
      this.simpanChat(teks, jawaban); bagiJawaban(jawaban);
    } catch (e) {
      let panggil = this.namaBos || "Bos";
      let jawabanBackup = "Bos, Groq saya putus sebentar. Tapi saya masih di sini, " + panggil + ".";
      this.simpanChat(teks, jawabanBackup); bagiJawaban(jawabanBackup);
    }
  }
};

OtakKecil.bacaDariBuku();
