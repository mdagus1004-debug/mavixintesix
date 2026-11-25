// =================================================
// OTAK TENGAH - WIKIPEDIA SAJA
// Tugas cuma 1:
// - Tunggu pertanyaan dari Otak Depan
// - Cari di Wikipedia
// - Kalau ada, bagi tau Depan: ada, ini jawabannya
// - Kalau tidak ada, bagi tau Depan: tidak ada
// Tidak putuskan soal Bos, tidak tolak, tidak pecah kalimat
// =================================================
async function otakTengah(pesanDariDepan) {
  const pesan = (pesanDariDepan || "").trim();

  if (!pesan) {
    return { ada: false, jawaban: null };
  }

  // Bersihkan kata tanya saja, pesan utuh tidak dipotong koma
  let cari = pesan
    .toLowerCase()
    .replace(/apa itu|siapa|siapakah|jelaskan|definisi|ibukota|ibu kota|tentang|ceritakan|berapa|kenapa|bagaimana|gimana|tolong|kamu tahu|kau tahu|bisakah|bisa kah|mohon|tolong jelaskan/gi, "")
    .replace(/\?/g, "")
    .replace(/\s+apa$/g, "")
    .replace(/\s+ya$/g, "")
    .replace(/\s+dong$/g, "")
    .trim();

  // Buang kata sisa depan: "saya mau tahu", "saya penasaran"
  cari = cari.replace(/^saya mau tahu\s+/g, "").replace(/^saya penasaran\s+/g, "").replace(/^saya ingin tahu\s+/g, "").trim();

  if (!cari || cari.length < 2) {
    return { ada: false, jawaban: null };
  }

  try {
    const res = await fetch("https://id.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(cari));
    const data = await res.json();
    if (data && data.extract) {
      const kalimat = data.extract.split(".");
      const pendek = kalimat.slice(0, 2).join(".") + ".";
      // Lapor ke Depan: ADA
      return { ada: true, jawaban: "Menurut Wikipedia Bos:\n\n" + pendek };
    }
    // Lapor ke Depan: TIDAK ADA
    return { ada: false, jawaban: null };
  } catch (e) {
    // Error juga lapor tidak ada, biar Depan yang putuskan ke Server
    return { ada: false, jawaban: null };
  }
}

window.OtakTengah = { cari: otakTengah, fikir: otakTengah, cariWikipedia: otakTengah };
