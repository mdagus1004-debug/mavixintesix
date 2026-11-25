// OTAK TENGAH - MAVIX V2.4 - CARI WIKIPEDIA
// Perbaikan: jangan buang ibu kota, buang kata tanya di awal saja
const OtakTengah = {
  async cari(teks) {
    try {
      let cari = teks.toLowerCase().trim();
      cari = cari.replace(/^(siapa|apa itu|jelaskan|tentang|cari|ceritakan)\s+/, "");
      cari = cari.replace(/\?+$/g, "").trim();
      if (!cari) return { ada: false, jawaban: null };
      const url = "https://id.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(cari);
      const r = await fetch(url);
      if (!r.ok) return { ada: false, jawaban: null };
      const d = await r.json();
      if (!d.extract) return { ada: false, jawaban: null };
      let jawab = d.extract;
      if (jawab.length > 600) jawab = jawab.slice(0, 600) + "...";
      return { ada: true, jawaban: jawab };
    } catch (e) {
      return { ada: false, jawaban: null };
    }
  }
};
window.OtakTengah = OtakTengah;
