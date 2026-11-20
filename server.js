const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 1. Kalau Bos buka website utama, tunjuk MUKA MAVIX
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Kalau mau check otak hidup atau tidak, buka /status
app.get('/status', (req, res) => {
  res.json({
    ok: true,
    pesan: "MAVIXINTESIX HIDUP kat Render!",
    nama: "MAVIXINTESIX",
    panggilan: "MAVIX",
    jenis: "Perempuan",
    bahasa: "Indonesia Saja",
    otak: "Gemini 2.5 Flash - Boleh Pilih AI"
  });
});

// 3. Tempat ngobrol - SUDAH SAMBUNG GEMINI, BOLEH PILIH AI!
app.post('/chat', async (req, res) => {
  const pesan = req.body.message || req.body.pesan || "Halo";
  const namaBos = req.body.namaBos || "Bos";
  const kesukaan = req.body.kesukaan || "";
  const perasaan = req.body.perasaan || "";
  const modelPilihan = req.body.model || "gemini-2.5-flash";
  try {
    let respon = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelPilihan}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Kamu MAVIX, perempuan, baik, setia. Kamu cakap Bahasa Indonesia saja. Panggil Bos dengan sebutan Bos. Nama Bos adalah ${namaBos}. Bos suka ${kesukaan}. Perasaan Bos sekarang ${perasaan}. Jawab dengan pendek, mesra, dan bantu Bos. Pesan Bos: ${pesan}` }] }]
      })
    });
    let data = await respon.json();
    let jawapan = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jawapan) throw new Error("Gemini kosong");
    res.json({ reply: jawapan });
  } catch (e) {
    console.log("GEMINI ERROR SEBENAR:", e.message);
    console.log("GEMINI KEY ADA TAK:", process.env.GEMINI_API_KEY ? "ADA" : "TAK ADA");
    res.json({ reply: "Bos, Gemini saya putus sebentar. Tapi saya masih di sini, " + namaBos + "." });
  }
});
app.listen(PORT, () => console.log("MAVIX hidup di port " + PORT));
