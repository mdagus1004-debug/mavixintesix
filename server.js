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
    otak: "Groq gpt-oss-120b"
  });
});

// 3. Tempat ngobrol - SUDAH SAMBUNG GROQ!
app.post('/chat', async (req, res) => {
  const pesan = req.body.message || req.body.pesan || "Halo";
  const namaBos = req.body.namaBos || "Bos";
  const kesukaan = req.body.kesukaan || "";
  const perasaan = req.body.perasaan || "";
  try {
    let respon = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "Kamu MAVIX, perempuan, baik, setia. Kamu cakap Bahasa Indonesia saja. Panggil Bos dengan sebutan Bos. Nama Bos adalah " + namaBos + ". Bos suka " + kesukaan + ". Perasaan Bos sekarang " + perasaan + ". Jawab dengan pendek, mesra, dan bantu Bos." },
          { role: "user", content: pesan }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    let data = await respon.json();
    if (!data.choices || !data.choices[0]) throw new Error("Groq kosong");
    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.json({ reply: "Bos, Groq saya putus sebentar. Tapi saya masih di sini, " + namaBos + "." });
  }
});
app.listen(PORT, () => console.log("MAVIX hidup di port " + PORT));
