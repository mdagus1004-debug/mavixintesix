// OTAK TENGAH MAVIX - Versi Baca Selengkapnya
async function otakTengah(pesan) {
  const kataFakta = ["apa itu", "siapa", "jelaskan", "definisi", "kapan", "dimana", "di mana", "ibukota", "siapakah"];

  const isFakta = kataFakta.some(k => pesan.toLowerCase().includes(k));
  if (!isFakta) return null;

  try {
    let cari = pesan.replace(/apa itu|siapa|siapakah|jelaskan|definisi|ibukota/gi, "").replace(/\?/g, "").trim();
    if (!cari) return null;

    const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cari)}`);
    const data = await res.json();

    if (data.extract) {
      // 1. Potong jadi pendek - 2 kalimat pertama
      const kalimat = data.extract.split('.');
      const pendek = kalimat.slice(0, 2).join('.') + '.';
      const panjang = data.extract;

      // 2. Kalau pendek = panjang, tidak usah tombol
      if (panjang.length < 300) {
        return "Menurut Wikipedia Bos:\n\n" + panjang;
      }

      // 3. Kalau panjang, buat tombol
      // Kita simpan yang panjang dalam ID unik
      const idUnik = "wiki_" + Date.now();
      window[idUnik] = panjang; // Simpan di memori

      return `Menurut Wikipedia Bos:\n\n${pendek}\n\n<button onclick="bukaSelengkapnya('${idUnik}', this)" style="background:#25D366;color:white;border:none;padding:6px 12px;border-radius:15px;cursor:pointer;">Baca Selengkapnya ▼</button><div id="isi_${idUnik}" style="display:none;margin-top:10px;">${panjang}<br><br><small>Sumber: Wikipedia</small></div>`;
    }
  } catch(e) {}
  return null;
}

// Fungsi untuk buka / tutup
function bukaSelengkapnya(id, tombol) {
  const isi = document.getElementById("isi_" + id);
  if (isi.style.display === "none") {
    isi.style.display = "block";
    tombol.innerHTML = "Tutup ▲";
  } else {
    isi.style.display = "none";
    tombol.innerHTML = "Baca Selengkapnya ▼";
  }
}
