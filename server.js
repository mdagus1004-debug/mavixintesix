// OTAK BESAR + MULUT MAVIX - Bahasa Indonesia
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
app.use(express.json());
app.use(express.static('.'));

const KUNCI_GROQ = process.env.GROQ_API_KEY;

// ===== CEK SERVER HIDUP =====
app.get('/tes', (req, res) => {
  res.json({ status: "hidup", pesan: "MAVIX sudah hidup Bos, Otak Besar, Otak Kecil, Mulut, dan Badan sudah nyambung semua!" });
});

// ===== SUARA EDGE MICROSOFT - CARA BARU =====
app.get("/suara", async (req, res) => {
  try {
    let teks = (req.query.teks || "").toString();
    if (!teks) return res.status(400).send("tidak ada teks");
    teks = teks.substring(0, 800);
    const tts = new EdgeTTS({
      voice: 'id-ID-GadisNeural',
      lang: 'id-ID',
      rate: '+0%',
      pitch: '+5Hz'
    });
    const fileTmp = path.join(os.tmpdir(), 'mavix-' + Date.now() + '.mp3');
    await tts.ttsPromise(teks, fileTmp);
    res.setHeader("Content-Type", "audio/mpeg");
    res.sendFile(fileTmp, () => {
      try { fs.unlinkSync(fileTmp); } catch(e) {}
    });
  } catch (e) {
    console.log("Edge gagal:", e.message);
    res.status(500).send("gagal");
  }
});

// ===== JALUR CHAT UTAMA =====
app.post('/chat', async (req, res) => {
  const pesanUser = req.body.message || "halo";
  const namaBos = req.body.namaBos || "Bos";
  const kesukaanBos = req.body.kesukaan || "";
  const perasaanBos = req.body.perasaan || "";
  let ingatanUntukGroq = "";
  if (namaBos && namaBos !== "Bos") ingatanUntukGroq += "Nama Bos adalah " + namaBos + ". ";
  if (kesukaanBos) ingatanUntukGroq += "Bos suka " + kesukaanBos + ". ";
  if (perasaanBos) ingatanUntukGroq += "Terakhir Bos merasa " + perasaanBos + ". ";
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
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KUNCI_GROQ },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: pesanSistem }, { role: "user", content: pesanUser }],
        max_tokens: 1000, temperature: 0.7
      })
    });
    const data = await r.json();
    if (data.choices && data.choices[0]) {
      let jawaban = data.choices[0].message.content || "";
      jawaban = jawaban.replace(/\*\*/g, "").replace(/\*/g, "").replace(/###/g, "").replace(/##/g, "").replace(/#/g, "").replace(/```/g, "").replace(/https?:\/\/wa\.me\/\S+/gi, "").replace(/\+62[\d\s\-()]+/g, "").trim();
      return res.json({ reply: jawaban });
    } else {
      return res.json({ reply: "GROQ bilang: " + JSON.stringify(data.error || data).slice(0, 300) });
    }
  } catch (e) {
    return res.json({ reply: "Bos, Groq saya putus sebentar: " + e.message + ". Tapi saya masih di sini Bos." });
  }
});

// ===== MULUT LAMA - JEMBATAN WEBSOCKET, DIBIARKAN SAJA DULU =====
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (client, req) => {
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('ConnectionId') || 'id';
  const edge = new WebSocket('wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB9E23DCC4F7E9424&ConnectionId=' + id);
  edge.on('open', () => {
    client.on('message', (m) => { try{ edge.send(m); }catch(e){} });
  });
  edge.on('message', (m) => { try{ client.send(m); }catch(e){} });
  edge.on('close', () => { try{ client.close(); }catch(e){} });
  client.on('close', () => { try{ edge.close(); }catch(e){} });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("MAVIX Hidup di port " + PORT));
