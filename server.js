// OTAK BESAR MAVIX - Bahasa Indonesia
// Server Groq GPT-120B
// SUDAH NYAMBUNG KE: Otak Kecil (otak.js) + Mulut (mulut.js) + Badan (index.html)

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

const GROQ_KEY = process.env.GROQ_API_KEY;

// ===== CEK SERVER HIDUP ATAU TIDAK =====
app.get('/', (req, res) => {
  res.send("MAVIX SUDAH HIDUP BOS! GROQ Sudah Jalan!");
});

// ===== JALUR CHAT UTAMA - DARI OTAK KECIL KE OTAK BESAR =====
app.post('/chat', async (req, res) => {
  // Ambil pesan + ingatan dari Otak Kecil
  const pesanUser = req.body.message || "halo";
  const namaBos = req.body.namaBos || "Bos";
  const kesukaanBos = req.body.kesukaan || "";
  const perasaanBos = req.body.perasaan || "";

  // Buat ingatan untuk Groq, biar Groq tidak lupa siapa Bos
  let ingatanUntukGroq = "";
  if (namaBos && namaBos !== "Bos") ingatanUntukGroq += "Nama Bos adalah " + namaBos + ". ";
  if (kesukaanBos) ingatanUntukGroq += "Bos suka " + kesukaanBos + ". ";
  if (perasaanBos) ingatanUntukGroq += "Terakhir Bos merasa " + perasaanBos + ". ";

  // Kepribadian MAVIX - Bahasa Indonesia
  const pesanSistem = "Kamu adalah MAVIX, asisten setia milik Bos. " +
    "Kamu bicara Bahasa Indonesia, gaya santai, akrab, sopan, dan selalu panggil Bos dengan sebutan Bos. " +
    "Kamu tidak pernah bicara Bahasa Melayu, Bahasa Inggris, atau bahasa lain, kecuali Bos yang minta. " +
    "Kamu jawab pendek dan jelas kalau Bos lagi mode kerja, jawab panjang dan hangat kalau Bos lagi curhat. " +
    "Kamu jangan pernah menulis simbol markdown seperti **, ###, atau ```. " +
    "Kamu jangan pernah menulis nomor telepon, link WA, atau nomor HP. " +
    "Ingatan tentang Bos: " + ingatanUntukGroq;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: pesanSistem },
          { role: "user", content: pesanUser }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await r.json();
    console.log("GROQ JAWAB:", JSON.stringify(data).slice(0, 500));

    if (data.choices && data.choices[0]) {
      let jawaban = data.choices[0].message.content || "";
      // Cuci jawaban - buang simbol biar mulut tidak baca simbol
      jawaban = jawaban
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/###/g, "")
        .replace(/##/g, "")
        .replace(/#/g, "")
        .replace(/```/g, "")
        .replace(/https?:\/\/wa\.me\/\S+/gi, "")
        .replace(/\+62[\d\s\-()]+/g, "")
        .trim();
      return res.json({ reply: jawaban });
    } else {
      return res.json({ reply: "GROQ bilang: " + JSON.stringify(data.error || data).slice(0, 300) });
    }
  } catch (e) {
    console.log("GROQ PUTUS:", e.message);
    return res.json({ reply: "Bos, Groq saya putus sebentar: " + e.message + ". Tapi saya masih di sini Bos." });
  }
});

// ===== JALUR TES SUARA - BUAT TES MULUT =====
app.get('/tes', (req, res) => {
  res.json({ status: "hidup", pesan: "MAVIX sudah hidup Bos, Otak Besar, Otak Kecil, Mulut, dan Badan sudah nyambung semua!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("MAVIX Hidup di port " + PORT));
