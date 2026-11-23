// OTAK TENGAH MAVIX V2.3 - VERSI LENGKAP
// Tugas file ini:
// Jawab pertanyaan pengetahuan pakai Wikipedia Indonesia.
// Contoh: "siapa itu Jokowi", "apa itu gravitasi", "di mana Jakarta"
// Kalau tidak ketemu di Wikipedia, kirim kosong, biar Groq yang jawab.

async function otakTengah(teks){
  if(!teks) return "";
  let t = teks.toLowerCase().trim();

  // --- 1. CEK, APAKAH INI PERTANYAAN PENGETAHUAN? ---
  // Kalau bukan pertanyaan pengetahuan, langsung berhenti, biar Groq yang jawab.
  // Jangan ambil pertanyaan curhat, seperti "aku sedih", "aku capek"
  let adalahPertanyaanPengetahuan = false;
  if(t.startsWith("siapa itu") || t.startsWith("siapa") || t.startsWith("apa itu") || t.startsWith("apa") || t.startsWith("di mana") || t.startsWith("dimana") || t.startsWith("kapan") || t.startsWith("mengapa") || t.startsWith("kenapa") || t.startsWith("bagaimana") || t.startsWith("jelaskan") || t.startsWith("ceritakan tentang")){
    adalahPertanyaanPengetahuan = true;
  }
  if(!adalahPertanyaanPengetahuan) return "";

  // --- 2. JANGAN AMBIL PERTANYAAN TENTANG BOS SENDIRI ---
  // Ini tugas otak-ingatan dan otak-kecil, bukan Wikipedia
  // Contoh: "siapa nama saya", "saya suka apa" -> jangan cari di Wikipedia
  if(t.includes("nama saya") || t.includes("saya suka") || t.includes("saya tinggal") || t.includes("pekerjaan saya") || t.includes("makanan saya") || t.includes("minuman saya")){
    return "";
  }

  // --- 3. BERSIHKAN PERTANYAAN, AMBIL KATA KUNCI ---
  // Contoh: "siapa itu Jokowi?" -> jadi "Jokowi"
  // Contoh: "apa itu gravitasi?" -> jadi "gravitasi"
  let cari = t;
  cari = cari.replace(/^\s*(tolong\s+)?(jelaskan|ceritakan tentang|ceritakan|jelaskan tentang)\s+/i, "");
  cari = cari.replace(/^\s*(siapa itu|siapa|apa itu|apa|di mana|dimana|kapan|mengapa|kenapa|bagaimana)\s+/i, "");
  cari = cari.replace(/[?.!]+$/g, "").trim();

  // Kalau kata kunci terlalu pendek, jangan cari
  // Contoh: "apa" saja -> terlalu pendek
  if(!cari || cari.length < 3) return "";

  // Kalau kata kunci masih ada kata "itu", "kah", "sih", buang
  cari = cari.replace(/\b(itu|kah|sih|dong|ya)\b/g, "").trim();
  if(!cari || cari.length < 3) return "";

  // --- 4. CARI DI WIKIPEDIA INDONESIA ---
  try{
    const res = await fetch("https://id.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(cari));
    // Kalau tidak ketemu (404), kirim kosong, biar Groq yang jawab
    if(!res.ok) return "";
    const data = await res.json();
    if(!data.extract) return "";

    // Ambil 400 huruf pertama saja, supaya tidak terlalu panjang untuk dibaca suara
    let hasil = data.extract.slice(0, 400).trim();

    // Kalau hasil masih ada tanda [1], [2] dari Wikipedia, buang
    hasil = hasil.replace(/\[\d+\]/g, "").trim();

    return hasil;
  }catch(e){
    // Kalau internet putus, kirim kosong, biar Groq yang coba jawab
    return "";
  }
}

window.otakTengah = otakTengah;
