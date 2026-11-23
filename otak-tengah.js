// OTAK TENGAH - WIKIPEDIA - BACA PENDEK, NGOBROL PANJANG
async function otakTengah(pesan, mode) {
  const tRendah = pesan.toLowerCase().trim();
  if (tRendah.includes("nama saya") || tRendah.includes("saya suka") || tRendah.includes("hobi saya") || tRendah.includes("makanan saya") || tRendah.includes("minuman saya") || tRendah.includes("saya tinggal") || tRendah.includes("kerja saya") || tRendah.includes("perasaan saya")) return null;
  if (tRendah === "lanjutkan" || tRendah === "terus" || tRendah === "teruskan") return null;

  const kataFakta = ["apa itu", "siapa", "jelaskan", "definisi", "kapan", "dimana", "di mana", "ibukota", "siapakah", "baca", "tentang", "ceritakan"];
  const isFakta = kataFakta.some(k => tRendah.includes(k));
  if (!isFakta) return null;
  try {
    let cari = pesan.replace(/apa itu|siapa|siapakah|jelaskan|definisi|ibukota|baca|tentang|ceritakan/gi, "").replace(/\?/g, "").trim();
    if (!cari) return null;
    const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cari)}`);
    const data = await res.json();
    if (data.extract) {
      const kalimat = data.extract.split('.');
      const pendek = kalimat.slice(0, 2).join('.') + '.';
      const panjang = data.extract;

      // BACA = pendek saja
      if (mode === "BACA") return "Menurut Wikipedia Bos:\n\n" + pendek;
      // NGOBROL = panjang terus
      return "Menurut Wikipedia Bos:\n\n" + panjang;
    }
  } catch(e) {}
  return null;
}
function bukaSelengkapnya(id, tombol) {
  const isi = document.getElementById("isi_" + id);
  if (!isi) return;
  if (isi.style.display === "none") { isi.style.display = "block"; tombol.innerHTML = "Tutup ▲"; }
  else { isi.style.display = "none"; tombol.innerHTML = "Baca Selengkapnya ▼"; }
}
window.OtakTengah = { fikir: otakTengah, cariWikipedia: otakTengah };
window.bukaSelengkapnya = bukaSelengkapnya;
