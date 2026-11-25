// =================================================
// OTAK DEPAN - MANAJER MAVIX - VERSI LENGKAP FINAL
// Alur Wajib:
// Simpan dulu -> Kecil (Kecil -> Nalar -> Kecil) -> Tengah (Wikipedia) -> Server (Groq + EdgeTTS)
// Depan yang putuskan kapan panggil Tengah, kapan panggil Server
// =================================================

// Tampilkan chat ke layar
function tampilChat(teks, siapa) {
  const box = document.getElementById("chatBox");
  if (!box) return;
  const div = document.createElement("div");
  div.className = siapa === "user" ? "chat-user" : "chat-mavix";
  div.textContent = (siapa === "user" ? "Bos: " : "Mavix: ") + teks;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Kirim jawaban Mavix: tampil + simpan + ngomong
async function kirimJawaban(jawab) {
  if (!jawab) return;
  tampilChat(jawab, "mavix");
  await simpanChat(jawab, "mavix");
  await bicara(jawab); // WAJIB await, karena Mulut sekarang panggil Server /suara dulu
}

// Fungsi utama, dipanggil dari index.html
async function prosesDepan(teks) {
  if (!teks || !teks.trim()) return null;
  const teksBersih = teks.trim();

  // 0. TAMPILKAN CHAT BOS
  tampilChat(teksBersih, "user");

  // 1. SIMPAN DULU - Wajib pertama, biar Nalar tidak balapan
  await simpanChat(teksBersih, "user");

  // 2. BEDAH PERINTAH - Wajib await, biar lemari sudah keisi sebelum Nalar baca
  await bedahPerintah(teksBersih);

  // 3. STOP - Kalau Bos bilang stop, jangan lanjut ke mana-mana
  const tStop = teksBersih.toLowerCase().trim().replace(/\s+/g, "");
  if (tStop === "stop" || tStop === "berhenti" || tStop === "diam" || tStop === "stopbicara" || tStop === "berhentibicara") {
    stopBicara();
    const jStop = "Baik Bos, saya diam.";
    await kirimJawaban(jStop);
    return jStop;
  }

  // 4. KE KECIL - Kecil yang manggil Nalar di dalam
  // Depan -> Kecil -> Nalar -> Kecil -> Depan
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

  // 5. KE TENGAH - Depan yang putuskan
  // Tengah cuma tunggu Depan, cari Wikipedia, lapor ada / tidak ada
  const tRendah = teksBersih.toLowerCase();

  // Kalau soal Bos murni, JANGAN panggil Tengah
  // Karena Nalar di atas sudah bilang null, artinya memang belum ada data Bos
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
    // Kalau Tengah bilang tidak ada, Depan lanjut ke Server, tidak berhenti
  }

  // 6. KE SERVER - Terakhir, Groq + EdgeTTS
  // Ambil ingatan Bos biar Groq kenal Bos
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

  // Baca mode dari localStorage, default NGOBROL
  let modeBos = "NGOBROL";
  try {
    const m = localStorage.getItem("modeMavix");
    if (m === "BACA" || m === "NGOBROL") modeBos = m;
  } catch (e) {}

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pesan: teksBersih,
        message: teksBersih, // Kirim 2 nama biar Server lama / baru sama-sama baca
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

// Biar bisa dipanggil dari index.html
window.prosesDepan = prosesDepan;
window.kirimJawaban = kirimJawaban;
window.tampilChat = tampilChat;
