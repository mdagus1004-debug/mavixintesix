// OTAK TENGAH - WIKIPEDIA
async function otakTengah(pesan) {
  const kataFakta = ["apa itu", "siapa", "jelaskan", "definisi", "kapan", "dimana", "di mana", "ibukota", "siapakah", "baca", "tentang", "ceritakan"];
  const isFakta = kataFakta.some(k => pesan.toLowerCase().includes(k));
  if (!isFakta) return null;
  let t = pesan.toLowerCase().trim();
  if (t === "lanjutkan" || t === "terus" || t === "teruskan") return null;
  try {
    let cari = pesan.replace(/apa itu|siapa|siapakah|jelaskan|definisi|ibukota|baca|tentang|ceritakan/gi, "").replace(/\?/g, "").trim();
    if (!cari) return null;
    const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cari)}`);
    const data = await res.json();
    if (data.extract) {
      const kalimat = data.extract.split('.');
      const pendek = kalimat.slice(0, 2).join('.') + '.';
      const panjang = data.extract;
      if (panjang.length < 300) return "Menurut Wikipedia Bos:\n\n" + panjang;
      const idUnik = "wiki_" + Date.now();
      return `Menurut Wikipedia Bos:\n\n${pendek}\n\n<button onclick="bukaSelengkapnya('${idUnik}', this)" style="background:#25D366;color:white;border:none;padding:6px 12px;border-radius:15px;cursor:pointer;">Baca Selengkapnya ▼</button><div id="isi_${idUnik}" style="display:none;margin-top:10px;">${panjang}<br><br><small>Sumber: Wikipedia</small></div>`;
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
