// OTAK TENGAH - WIKIPEDIA - VERSI BETUL
async function otakTengah(pesan, mode){
  const tRendah = pesan.toLowerCase().trim();
  // Ambil yang terakhir saja
  let pot = tRendah.split(/[,.\n]| eh | terus | lalu /);
  let tTerakhir = pot[pot.length - 1].trim();
  if(tTerakhir === "" && pot.length > 1) tTerakhir = pot[pot.length - 2].trim();
  if(!tTerakhir) tTerakhir = tRendah;
  // Kalau cuma 1 kata, bukan urusan Wikipedia
  if(tTerakhir === "siapa" || tTerakhir === "dimana" || tTerakhir === "di mana" || tTerakhir === "hallo" || tTerakhir === "halo" || tTerakhir === "hai") return null;
  if(tTerakhir.length < 3) return null;
  if(tTerakhir.includes("nama saya") || tTerakhir.includes("saya suka") || tTerakhir.includes("hobi saya") || tTerakhir.includes("makanan saya") || tTerakhir.includes("minuman saya") || tTerakhir.includes("saya tinggal") || tTerakhir.includes("kerja saya") || tTerakhir.includes("perasaan saya")) return null;
  if(tTerakhir === "lanjutkan" || tTerakhir === "terus" || tTerakhir === "teruskan") return null;
  const kataFakta = ["apa itu", "siapa", "jelaskan", "definisi", "kapan", "dimana", "di mana", "ibukota", "siapakah", "baca", "tentang", "ceritakan"];
  const isFakta = kataFakta.some(k => tTerakhir.includes(k));
  if(!isFakta) return null;
  try{
    let cari = tTerakhir.replace(/apa itu|siapa|siapakah|jelaskan|definisi|ibukota|baca|tentang|ceritakan/gi, "").replace(/\?/g, "").trim();
    if(!cari) return null;
    const res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cari)}`);
    const data = await res.json();
    if(data.extract){
      const kalimat = data.extract.split('.');
      const pendek = kalimat.slice(0, 2).join('.') + '.';
      const panjang = data.extract;
      if(mode === "BACA") return "Menurut Wikipedia Bos:\n\n" + pendek;
      return "Menurut Wikipedia Bos:\n\n" + panjang;
    }
  }catch(e){}
  return null;
}
function bukaSelengkapnya(id, tombol){
  const isi = document.getElementById("isi_" + id);
  if(!isi) return;
  if(isi.style.display === "none"){ isi.style.display = "block"; tombol.innerHTML = "Tutup ▲"; }
  else { isi.style.display = "none"; tombol.innerHTML = "Baca Selengkapnya ▼"; }
}
window.OtakTengah = { fikir: otakTengah, cariWikipedia: otakTengah };
window.bukaSelengkapnya = bukaSelengkapnya;
