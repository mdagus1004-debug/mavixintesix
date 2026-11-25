// OTAK DEPAN - MAVIX V2.4 - MANAGER
// Perbaikan: kirim riwayat ke server
function tampilChat(teks, siapa) {
  if (typeof window.tambah === 'function') {
    window.tambah(siapa, teks);
    return;
  }
  const box = document.getElementById("chatBox");
  if (!box) return;
  const div = document.createElement("div");
  div.className = siapa === "user" ? "msg user" : "msg mavix";
  div.textContent = teks;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
async function kirimJawaban(jawab) {
  if (!jawab) return;
  tampilChat(jawab, "mavix");
  try { await simpanChat(jawab, "mavix"); } catch(e){}
  try { await bicara(jawab); } catch(e){}
}
async function prosesDepan(teks) {
  if (!teks || !teks.trim()) return null;
  const teksBersih = teks.trim();
  if (typeof window.perintahLemariViaChat === 'function') {
    const hasilLemari = await window.perintahLemariViaChat(teksBersih);
    if (hasilLemari) {
      tampilChat(teksBersih, "user");
      try { await simpanChat(teksBersih, "user"); } catch(e){}
      await kirimJawaban(hasilLemari);
      return hasilLemari;
    }
  }
  tampilChat(teksBersih, "user");
  try { await simpanChat(teksBersih, "user"); } catch(e){}
  try { await bedahPerintah(teksBersih); } catch(e){}
  const tStop = teksBersih.toLowerCase().trim().replace(/\s+/g, "");
  if (tStop === "stop" || tStop === "berhenti" || tStop === "diam" || tStop === "stopbicara" || tStop === "berhentibicara") {
    try { stopBicara(); } catch(e){}
    const jStop = "Baik Bos, saya diam.";
    await kirimJawaban(jStop);
    return jStop;
  }
  let jawab = null;
  try { jawab = await fikirKecil(teksBersih); } catch (e) { jawab = null; }
  if (jawab) { await kirimJawaban(jawab); return jawab; }
  const tRendah = teksBersih.toLowerCase();
  const soalBosMurni = tRendah.includes("nama saya") || tRendah.includes("namaku") || tRendah.includes("hobi saya") || tRendah.includes("saya suka") || tRendah.includes("saya tinggal") || tRendah.includes("pekerjaan saya") || tRendah.includes("kerja saya") || tRendah.includes("siapa saya") || tRendah.includes("tadi saya bilang") || tRendah.includes("siapa namaku") || tRendah.includes("apa hobi saya");
  const isPertanyaanFakta = teksBersih.includes("?") || tRendah.includes("apa itu") || tRendah.includes("siapa") || tRendah.includes("jelaskan") || tRendah.includes("ibu kota") || tRendah.includes("ibukota") || tRendah.includes("berapa") || tRendah.includes("kenapa") || tRendah.includes("bagaimana") || tRendah.includes("gimana") || tRendah.includes("kapan") || tRendah.includes("dimana") || tRendah.includes("definisi") || tRendah.includes("ceritakan") || tRendah.includes("tentang");
  if (!soalBosMurni && isPertanyaanFakta) {
    let hasilTengah = { ada: false, jawaban: null };
    try { hasilTengah = await OtakTengah.cari(teksBersih); } catch (e) {}
    if (hasilTengah && hasilTengah.ada && hasilTengah.jawaban) {
      await kirimJawaban(hasilTengah.jawaban);
      return hasilTengah.jawaban;
    }
  }
  let namaBos = "";
  let sukaBos = "";
  let perasaanBos = "";
  try {
    const n = ubahJadiTeks(await ambilCatatan("nama"));
    if (n) namaBos = n;
    const s = ubahJadiTeks(await ambilCatatan("suka"));
    if (s) sukaBos = s;
    const f = ubahJadiTeks(await ambilCatatan("perasaan"));
    if (f) perasaanBos = f;
  } catch (e) {}
  let modeBos = window.modeMavix || "NGOBROL";
  try {
    const mArr = await ambilCatatan("mode");
    if (mArr && mArr[0]) modeBos = mArr[0];
  } catch(e){}
  let riwayat = [];
  try { riwayat = await ambilLimaTerakhir(); } catch(e){}
  try {
    const r = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesan: teksBersih, message: teksBersih, namaBos: namaBos || "Bos", kesukaan: sukaBos || "", perasaan: perasaanBos || "", mode: modeBos, riwayat: riwayat })
    });
    const d = await r.json();
    jawab = d.jawaban || d.reply || d.text || null;
  } catch (e) {
    jawab = "Maaf Bos, Server lagi tidak bisa dihubungi.";
  }
  if (jawab) await kirimJawaban(jawab);
  return jawab;
}
document.addEventListener("DOMContentLoaded", function(){
  const btn = document.getElementById("kirimBtn");
  const inp = document.getElementById("input");
  if(!btn || btn.dataset.depanSudah) return;
  btn.dataset.depanSudah = "1";
  btn.addEventListener("click", async function(){
    const teks = (inp.value || "").trim();
    if(!teks) return;
    inp.value = "";
    await prosesDepan(teks);
  });
  if(inp){
    inp.addEventListener("keydown", function(e){
      if(e.key === "Enter"){ e.preventDefault(); btn.click(); }
    });
  }
});
window.prosesDepan = prosesDepan;
window.kirimJawaban = kirimJawaban;
window.tampilChat = tampilChat;
