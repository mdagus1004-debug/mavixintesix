// OTAK DEPAN MAVIX - MANAJER / PREFRONTAL CORTEX
// Tugasnya cuma 1: ATUR SIAPA YANG JAWAB. Tidak boleh mikir sendiri.

async function kirim() {
  let input = document.getElementById("teks");
  let teks = input.value.trim();
  if (!teks) return;
  input.value = "";
  input.focus();

  // 1. Tampilkan chat Bos
  if (typeof tambah === "function") tambah(teks, "bos");

  // 2. Diamkan mulut lama
  if (typeof stopMulut === "function") stopMulut();

  let jawaban = null;

  // 3. TANYA OTAK KECIL DULU - Yang Gampang
  try {
    if (typeof OtakKecil !== "undefined" && typeof OtakKecil.fikirKecil === "function") {
      jawaban = OtakKecil.fikirKecil(teks);
    }
  } catch(e) { jawaban = null; }

  // 4. KALAU KECIL TIDAK TAHU, TANYA OTAK TENGAH - Wikipedia
  if (!jawaban) {
    try {
      if (typeof otakTengah === "function") {
        jawaban = await otakTengah(teks);
      }
    } catch(e) { jawaban = null; }
  }

  // 5. KALAU TENGAH TIDAK TAHU, TANYA OTAK BESAR - Groq / Server
  if (!jawaban) {
    try {
      let namaBos = (typeof ambilIngatan === "function") ? ambilIngatan("nama") : "";
      let sukaBos = (typeof ambilIngatan === "function") ? ambilIngatan("suka") : "";
      let rasaBos = (typeof ambilIngatan === "function") ? ambilIngatan("perasaan") : "";

      let res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: teks, namaBos: namaBos, kesukaan: sukaBos, perasaan: rasaBos })
      });
      let data = await res.json();
      jawaban = data.reply || "Bos, saya tidak dapat jawab tadi!";
    } catch(e) {
      jawaban = "Bos, Groq saya putus sebentar. Tapi saya masih di sini.";
    }
  }

  // 6. SIMPAN CHAT + TAMPILKAN + BICARA
  try { if (typeof OtakKecil !== "undefined") OtakKecil.simpanChat(teks, jawaban); } catch(e) {}

  if (typeof tambah === "function") tambah(jawaban, "mavix");
  if (typeof bicara === "function") bicara(jawaban);
}

window.kirim = kirim;
console.log("otak-depan hidup! Manajer siap Bos.");
