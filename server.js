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

// 3. Tempat ngobrol
app.post('/chat', async (req, res) => {
  const pesan = req.body.message || req.body.pesan || "Halo";
  // Nanti kita sambung ke Groq di sini
  res.json({ reply: "Halo Bos! Saya MAVIX. Saya sudah hidup dan sudah ada muka. Bos tanya apa?" });
});

app.listen(PORT, () => console.log("MAVIX hidup di port " + PORT));
