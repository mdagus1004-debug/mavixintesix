// =================================================
// OTAK DEPAN - MANAJER MAVIX - VERSI LENGKAP FINAL
// Alur Wajib:
// Simpan dulu -> Kecil (Kecil -> Nalar -> Kecil) -> Tengah (Wikipedia) -> Server (Groq + EdgeTTS)
// Depan yang putuskan kapan panggil Tengah, kapan panggil Server
// =================================================

// Tampilkan chat ke layar - PAKAI tambah() dari index.html, biar 1 gaya saja
function tampilChat(teks, siapa) {
  // Pakai tambah() dari index.html, class msg user / msg mavix, gelembung biru
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

// Kirim jawaban Mavix: tampil + simpan + ngomong
async function kirimJawaban(jawab) {
  if (!jawab) return;
  tampilChat(jawab, "mavix");
  try { await simpanChat(jawab, "mavix"); } catch(e){}
  try { await bicara(jawab); } catch(e){}
}

// Fungsi utama, dipanggil dari index.html
async function prosesDepan(teks) {
  if (!teks || !teks.trim()) return null;
  const teksBersih = teks.trim();

  // 0. JALUR 2 LEMARI LEWAT CHAT - Cek dulu, jangan kirim ke Server
  // Contoh: "ubah suka kopi jadi teh tarik", "hapus kopi dari suka", "lupakan kopi", "tambah teh tarik ke suka"
  if (typeof window.perintahLemariViaChat === 'function') {
    const hasilLemari = await window.perintahLemariViaChat(teksBersih);
    if (hasilLemari) {
      // Tampilkan chat Bos dulu, baru jawaban lemari
      tampilChat(teksBersih, "user");
      await kirimJawaban(hasilLemari);
      return hasilLemari;
    }
  }

  // 1. TAMPILKAN CHAT BOS - 1x saja di sini, jangan tampil lagi di index.html
  tampilChat(teksBersih, "user");

  // 2. SIMPAN DULU - Wajib pertama, biar Nalar tidak balapan
  try { await simpanChat(teksBersih, "user"); } catch(e){}

  // 3. BEDAH PERINTAH - Wajib await, biar lemari sudah keisi sebelum Nalar baca
  try { await bedahPerintah(teksBersih); } catch(e){}

  // 4. STOP - Kalau Bos bilang stop, jangan lanjut ke mana-mana
  const tStop = teksBersih.toLowerCase().trim().replace(/\s+/g, "");
  if (tStop === "stop" || tStop === "berhenti" || tStop === "diam" || tStop === "stopbicara" || tStop === "berhentibicara") {
    try { stopBicara(); } catch(e){}
    const jStop = "Baik Bos, saya diam.";
    await kirimJawaban(jStop);
    return jStop;
  }

  // 5. KE KECIL - Kecil yang manggil Nalar di dalam
  let jawab = null;
  try {
    jawab = await fikirKecil(teksBersih);
  } catch (e) {
    jawab = null;
  }
  if (jawab) {
    await kirimJawaban(jawab);
    return jawab;
  }

  // 6. KE TENGAH - Depan yang putuskan
  const tRendah = teksBersih.toLowerCase();
  const soalBosMurni =
    tRendah.includes("nama saya") ||
    tRendah.includes("namaku") ||
    tRendah.includes("hobi saya") ||
    tRendah.includes("saya suka") ||
    tRendah.includes("saya tinggal") ||
    tRendah.includes("pekerjaan saya") ||
    tRendah.includes("kerja saya") ||
    tRendah.includes("siapa saya") ||
    tRendah.includes("tadi saya bilang") ||
    tRendah.includes("siapa namaku") ||
    tRendah.includes("apa hobi saya");

  const isPertanyaanFakta =
    teksBersih.includes("?") ||
    tRendah.includes("apa itu") ||
    tRendah.includes("siapa") ||
    tRendah.includes("jelaskan") ||
    tRendah.includes("ibu kota") ||
    tRendah.includes("ibukota") ||
    tRendah.includes("berapa") ||
    tRendah.includes("kenapa") ||
    tRendah.includes("bagaimana") ||
    tRendah.includes("gimana") ||
    tRendah.includes("kapan") ||
    tRendah.includes("dimana") ||
    tRendah.includes("definisi") ||
    tRendah.includes("ceritakan") ||
    tRendah.includes("tentang");

  if (!soalBosMurni && isPertanyaanFakta) {
    let hasilTengah = { ada: false, jawaban: null };
    try {
      hasilTengah = await OtakTengah.cari(teksBersih);
    } catch (e) {
      hasilTengah = { ada: false, jawaban: null };
    }
    if (hasilTengah && hasilTengah.ada && hasilTengah.jawaban) {
      await kirimJawaban(hasilTengah.jawaban);
      return hasilTengah.jawaban;
    }
  }

  // 7. KE SERVER - Terakhir, Groq + EdgeTTS
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

  // Baca mode dari window.modeMavix / Ingatan, BUKAN lagi localStorage
  let modeBos = window.modeMavix || "NGOBROL";
  try {
    const mArr = await ambilCatatan("mode");
    if (mArr && mArr[0]) modeBos = mArr[0];
  } catch(e){}

  try {

const r = await fetch("/chat", {
    
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pesan: teksBersih,
        message: teksBersih,
        namaBos: namaBos || "Bos",
        kesukaan: sukaBos || "",
        perasaan: perasaanBos || "",
        mode: modeBos
      })
    });
    const d = await r.json();
    jawab = d.jawaban || d.reply || d.text || null;
  } catch (e) {
    jawab = "Maaf Bos, Server lagi tidak bisa dihubungi.";
  }

  if (jawab) {
    await kirimJawaban(jawab);
  }
  return jawab;
}

// ===== TOMBOL KIRIM - PEGANG DI SINI SAJA, 1x, BIAR TIDAK DOUBLE =====
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

// Biar bisa dipanggil dari index.html
window.prosesDepan = prosesDepan;
window.kirimJawaban = kirimJawaban;
window.tampilChat = tampilChat;
