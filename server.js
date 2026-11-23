// OTAK BESAR + MULUT MAVIX V2.3 - VERSI BERSIH, SUDAH DIPERBAIKI
const express = require('express');
const cors = require('cors');
const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
const KUNCI_GROQ = process.env.GROQ_API_KEY;

app.get('/tes', (req, res) => { res.json({ status: "hidup", pesan: "MAVIX sudah hidup Bos!" }); });

app.get("/suara", async (req, res) => {
  try{
    let teks = (req.query.teks || "").toString();
    if(!teks) return res.status(400).send("tidak ada teks");
    teks = teks.substring(0, 800);
    const fileTmp = path.join(os.tmpdir(), 'mavix-' + Date.now() + '.mp3');
    const tts = new EdgeTTS();
    await tts.synthesize(teks, 'id-ID-GadisNeural', fileTmp);
    if(!fs.existsSync(fileTmp)) return res.status(500).send("gagal");
    res.setHeader("Content-Type", "audio/mpeg");
    res.sendFile(fileTmp, () => { try{ fs.unlinkSync(fileTmp); }catch(e){} });
  }catch(e){ console.log("Edge gagal:", e.message); res.status(500).send("gagal"); }
});

app.post('/chat', async (req, res) => {
  const pesanUser = req.body.message || "halo";
  const namaBos = req.body.namaBos || "Bos";
  const kesukaanBos = req.body.kesukaan || "";
  const perasaanBos = req.body.perasaan || "";
  const modeBos = req.body.mode || "NGOBROL";
  let ingatanUntukGroq = "";
  if(namaBos && namaBos !== "Bos") ingatanUntukGroq += "Nama Bos adalah " + namaBos + ". ";
  if(kesukaanBos) ingatanUntukGroq += "Bos suka " + kesukaanBos + ". ";
  if(perasaanBos) ingatanUntukGroq += "Terakhir Bos merasa " + perasaanBos + ". ";
  let aturanMode = "";
  if(modeBos === "BACA"){ aturanMode = "Bos sedang Mode BACA. Jawab pendek, padat, 1-2 kalimat saja, jangan cerita panjang. "; }
  else { aturanMode = "Bos sedang Mode NGOBROL. Jawab hangat, agak panjang, seperti kawan. "; }
  const pesanSistem = "Kamu adalah MAVIX, asisten setia milik Bos. " +
    "Kamu bicara Bahasa Indonesia, gaya santai, akrab, sopan, dan selalu panggil Bos dengan sebutan Bos. " +
    "Kamu tidak pernah bicara Bahasa Melayu, Bahasa Inggris, atau bahasa lain, kecuali Bos yang minta. " +
    aturanMode +
    "Kamu jangan pernah menulis simbol markdown seperti **, ###, atau ```. " +
    "Kamu jangan pernah menulis nomor telepon, link WA, atau nomor HP. " +
    "ATURAN PENTING: Otak Kecil sudah menangani sapaan, jam, stop, dan terima kasih. Jadi kamu fokus ke pertanyaan berat, curhat, dan ingatan. " +
    "ATURAN LANJUTKAN: Kalau Bos bilang 'lanjutkan', 'terus', 'teruskan', jangan ulang dari awal. Sambung cerita dari CHAT TERAKHIR yang saya beri. Jangan tanya 'lanjutkan apa?'. Terus sambung saja. " +
    "Ingatan tentang Bos: " + ingatanUntukGroq;
  try{
    if(!KUNCI_GROQ) return res.json({ reply: "Bos, GROQ_API_KEY saya belum dipasang di Render." });
    let maxToken = modeBos === "BACA" ? 300 : 1500;
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KUNCI_GROQ },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: pesanSistem }, { role: "user", content: pesanUser }], max_tokens: maxToken, temperature: 0.7 })
    });
    const data = await r.json();
    if(data.choices && data.choices[0]){
      let jawaban = data.choices[0].message.content || "";
      jawaban = jawaban.replace(/\*\*/g, "").replace(/\*/g, "").replace(/###/g, "").replace(/##/g, "").replace(/#/g, "").replace(/```/g, "").replace(/https?:\/\/wa\.me\/\S+/gi, "").replace(/\+62[\d\s\-()]+/g, "").trim();
      return res.json({ reply: jawaban });
    } else { return res.json({ reply: "GROQ bilang: " + JSON.stringify(data.error || data).slice(0, 300) }); }
  }catch(e){ return res.json({ reply: "Bos, Groq saya putus sebentar: " + e.message + ". Tapi saya masih di sini Bos." }); }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("MAVIX Hidup di port " + PORT));
