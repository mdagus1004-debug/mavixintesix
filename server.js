// =================================================
// OTAK BESAR + MULUT MAVIX V2.4 - REVISI FINAL
// - Model GPT-OSS-120B via Groq
// - Suara Server EdgeTTS resmi
// - Perbaikan: terima riwayat biar lanjutkan nyambung
// =================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const GROQ_KEY = process.env.GROQ_API_KEY || "";
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
  try {
    const { pesan, message, namaBos, kesukaan, perasaan, mode, riwayat } = req.body || {};
    const pesanTeks = (pesan || message || "").toString().trim();
    if (!pesanTeks) return res.json({ jawaban: "Bos belum ngomong apa-apa." });

    const nama = (namaBos || "Bos").toString();
    const suka = (kesukaan || "").toString();
    const rasa = (perasaan || "").toString();

    let aturanMode = "";
    if (mode === "FOKUS") aturanMode = "Mode FOKUS. Jawab singkat, jelas, to the point, tanpa basa-basi.";
    else if (mode === "SANTAI") aturanMode = "Mode SANTAI. Jawab santai, ramah, boleh bercanda ringan.";
    else if (mode === "BACA") aturanMode = "Mode BACA. Jawab singkat, rapi, seperti membacakan buku.";
    else aturanMode = "Mode NGOBROL. Jawab santai, hangat, seperti teman dekat.";

    const aturanSistem = `Kamu adalah MAVIX, teman ngobrol cerdas milik ${nama}.
${aturanMode}
Aturan:
- Panggil user dengan sebutan Bos.
- Kalau Bos bilang lanjutkan, terus, lanjut, sambung dari CHAT TERAKHIR yang saya beri.
- Kalau Bos bertanya soal dirinya, jawab dari info: nama=${nama}, suka=${suka}, perasaan=${rasa}.
- Jangan sebut dirimu AI, robot, atau model bahasa.
- Bahasa Indonesia santai, jelas, tidak kaku.
- Jangan kasih jawaban panjang kalau tidak diminta.
- Jangan pakai emoji berlebihan.`;

    const history = Array.isArray(riwayat) ? riwayat.slice(-5).map(x => ({ role: x.siapa === "user" ? "user" : "assistant", content: String(x.teks || "") })) : [];

    const messages = [
      { role: "system", content: aturanSistem },
      ...history,
      { role: "user", content: pesanTeks }
    ];

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messages,
        temperature: 0.7,
        max_tokens: mode === "BACA" ? 300 : 500
      })
    });

    const d = await r.json();
    const jawaban = d?.choices?.[0]?.message?.content || "Maaf Bos, otak besar lagi bingung.";
    res.json({ jawaban });
  } catch (e) {
    res.json({ jawaban: "Maaf Bos, Server lagi tidak bisa dihubungi." });
  }
});

app.get('/suara', async (req, res) => {
  try {
    const teks = (req.query.teks || "").toString().slice(0, 800);
    if (!teks) return res.status(400).send("kosong");
    const key = process.env.EDGE_TTS_KEY || "";
    const region = process.env.EDGE_TTS_REGION || "southeastasia";
    if (!key) return res.status(500).send("key kosong");
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "MAVIX"
      },
      body: `<speak version='1.0' xml:lang='id-ID'><voice xml:lang='id-ID' xml:gender='Female' name='id-ID-GadisNeural'>${teks.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</voice></speak>`
    });
    if (!r.ok) return res.status(500).send("gagal");
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buf);
  } catch (e) {
    res.status(500).send("error");
  }
});

app.listen(PORT, () => console.log("MAVIX jalan di " + PORT));
