// OTAK KECIL MAVIX V2.3 - VERSI LENGKAP
// Tugas file ini:
// Jawab yang ringan, cepat, tanpa panggil Groq.
// Kalau file ini jawab, otak-depan tidak panggil Groq lagi.
// Kalau file ini tidak jawab (kirim ""), baru otak-depan panggil Groq.

function otakKecil(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();
  // Buang tanda baca di ujung, supaya mudah dicocokkan
  let tBersih = t.replace(/[?.!]+$/g, "").trim();

  // --- 1. STOP / DIAM / BERHENTI ---
  // Ini paling penting, harus dicek paling awal
  // Kalau Bos bilang diam, Mavix langsung diam, tidak jawab panjang
  if(t.includes("stop") || t.includes("diam") || t.includes("berhenti") || t.includes("cukup") || t.includes("sudah diam")){
    return "STOP";
  }

  // --- 2. JAM ---
  // Contoh: "jam berapa", "pukul berapa", "sekarang jam berapa"
  if(t.includes("jam berapa") || t.includes("pukul berapa") || tBersih === "jam" || tBersih === "pukul"){
    return "JAM:" + new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  }

  // --- 3. TANGGAL / HARI ---
  // Contoh: "hari ini tanggal berapa", "sekarang hari apa"
  if(t.includes("tanggal berapa") || t.includes("hari ini tanggal") || t.includes("sekarang tanggal")){
    return "TANGGAL:" + new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if(t.includes("hari apa") || tBersih === "hari ini hari apa"){
    return "TANGGAL:" + new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // --- 4. SAPAAN ---
  // Contoh: "halo", "hai", "hei", "selamat pagi", "selamat malam"
  if(tBersih === "halo" || tBersih === "hai" || tBersih === "hei" || tBersih === "hi" || tBersih === "hello"){
    return "Halo Bos, saya di sini. Bos mau cerita apa hari ini?";
  }
  if(t.includes("selamat pagi")){
    return "Selamat pagi Bos. Sudah sarapan belum Bos?";
  }
  if(t.includes("selamat siang")){
    return "Selamat siang Bos. Bos sedang apa siang ini?";
  }
  if(t.includes("selamat sore")){
    return "Selamat sore Bos. Capek ya Bos hari ini?";
  }
  if(t.includes("selamat malam")){
    return "Selamat malam Bos. Bos belum tidur?";
  }
  if(t.includes("apa kabar") || t.includes("bagaimana kabar") || t.includes("gimana kabar")){
    return "Kabar saya baik Bos, karena Bos ada di sini. Bos sendiri bagaimana kabarnya?";
  }

  // --- 5. TERIMA KASIH ---
  if(t.includes("terima kasih") || t.includes("makasih") || t.includes("terimakasih") || t.includes("thanks")){
    return "Sama-sama Bos. Senang bisa bantu Bos.";
  }

  // --- 6. SIAPA NAMA SAYA - TANYA BALIK KE INGATAN ---
  // Ini pakai otak-ingatan.js, jadi tidak perlu tanya Groq
  // Contoh: Bos tanya "siapa nama saya?" -> jawab dari catatan
  if(t.includes("siapa nama saya") || t.includes("nama saya siapa") || tBersih === "nama saya"){
    let nama = "";
    try{ nama = window.ambilCatatan ? window.ambilCatatan("nama") : ""; }catch(e){ nama = ""; }
    if(nama) return "Nama Bos adalah " + nama + ". Saya ingat Bos.";
    return "Saya belum tahu nama Bos. Bos mau kasih tahu saya? Bos bilang saja, nama saya adalah ...";
  }

  // --- 7. SAYA SUKA APA - TANYA BALIK KE INGATAN ---
  if(t.includes("saya suka apa") || t.includes("apa yang saya suka")){
    let suka = "";
    try{ suka = window.ambilCatatan ? window.ambilCatatan("suka") : ""; }catch(e){ suka = ""; }
    if(suka) return "Bos suka " + suka + ". Betul kan Bos?";
    return "Saya belum tahu Bos suka apa. Bos kasih tahu saya ya Bos, Bos suka apa?";
  }

  // --- 8. SAYA TINGGAL DI MANA ---
  if(t.includes("saya tinggal di mana") || t.includes("saya di mana") || t.includes("rumah saya di mana")){
    let kota = "";
    try{ kota = window.ambilCatatan ? window.ambilCatatan("kota") : ""; }catch(e){ kota = ""; }
    if(kota) return "Bos tinggal di " + kota + ". Saya ingat Bos.";
    return "Saya belum tahu Bos tinggal di mana. Bos tinggal di mana?";
  }

  // --- 9. KERJA SAYA APA ---
  if(t.includes("kerja saya apa") || t.includes("pekerjaan saya apa") || t.includes("saya kerja apa")){
    let kerja = "";
    try{ kerja = window.ambilCatatan ? window.ambilCatatan("pekerjaan") : ""; }catch(e){ kerja = ""; }
    if(kerja) return "Pekerjaan Bos adalah " + kerja + ". Saya ingat Bos.";
    return "Saya belum tahu pekerjaan Bos. Bos kerja apa?";
  }

  // --- 10. MAKANAN / MINUMAN FAVORIT SAYA ---
  if(t.includes("makanan favorit saya") || t.includes("makanan saya apa")){
    let m = "";
    try{ m = window.ambilCatatan ? window.ambilCatatan("makanan") : ""; }catch(e){ m = ""; }
    if(m) return "Makanan favorit Bos adalah " + m + ".";
    return "Saya belum tahu makanan favorit Bos. Bos suka makan apa?";
  }
  if(t.includes("minuman favorit saya") || t.includes("minuman saya apa")){
    let m = "";
    try{ m = window.ambilCatatan ? window.ambilCatatan("minuman") : ""; }catch(e){ m = ""; }
    if(m) return "Minuman favorit Bos adalah " + m + ".";
    return "Saya belum tahu minuman favorit Bos. Bos suka minum apa?";
  }

  // --- 11. HAPUS INGATAN ---
  // Contoh: "hapus ingatan", "lupa semua", "lupakan saya"
  if(t.includes("hapus ingatan") || t.includes("lupakan semua") || t.includes("lupa semua") || t.includes("hapus memori")){
    try{ if(window.hapusSemuaIngatan) window.hapusSemuaIngatan(); }catch(e){}
    return "Baik Bos, semua ingatan sudah saya hapus. Kita mulai dari awal lagi ya Bos.";
  }

  // --- 12. SIAPA KAMU ---
  if(t.includes("siapa kamu") || t.includes("kamu siapa") || tBersih === "namamu siapa" || t.includes("nama kamu siapa")){
    return "Saya MAVIX, teman ngobrol Bos. Saya di sini untuk temani Bos ngobrol.";
  }

  // --- 13. KAMU SEDANG APA ---
  if(t.includes("kamu sedang apa") || t.includes("kamu lagi apa") || t.includes("sedang apa")){
    return "Saya sedang menunggu Bos. Bos mau cerita apa?";
  }

  // --- 14. TIDAK ADA YANG COCOK ---
  // Kirim kosong, supaya otak-depan lanjut ke otak-tengah / Groq
  return "";
}

window.otakKecil = otakKecil;
