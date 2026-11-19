// server.js - MAVIX INTESIX - Backend Render
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const GROQ_API_KEY = process.env.GROQ_API_KEY || "gsk_XXXXXXXXXXXXXXXX";
let memori = { namaBos: "", deposit: 0 };
app.get('/', (req, res) => {
  res.json({ ok: true, pesan: "MAVIX INTESIX HIDUP kat Render!", nama: "MAVIX INTESIX", panggilan: "MAVIX", jenis: "Perempuan", bahasa: "Indonesia Saja", otak: "Groq gpt-oss-120b" });
});
app.post('/otak', async (req, res) => {
  try{
    let teks = req.body.teks || "";
    let t = teks.toLowerCase();
    if(t.includes("halo") || t.includes("hai")){
      return res.json({ jawapan: "Halo Bos, saya MAVIX INTESIX. Apa kabar? Ada yang bisa saya bantu?" });
    }
    if(t.includes("nama kamu") || t.includes("siapa kamu")){
      return res.json({ jawapan: "Nama saya MAVIX INTESIX Bos, robot pembantu Bos. Bos yang membuat saya." });
    }
    if(t.includes("perempuan") || t.includes("jenis kelamin")){
      return res.json({ jawapan: "Ya Bos, saya MAVIX INTESIX perempuan, teman Bos yang bantu Bos." });
    }
    if(t.includes("nama saya")){
      memori.namaBos = teks.replace(/nama saya/i, "").trim();
      return res.json({ jawapan: "Baik Bos, saya ingat. Nama Bos " + memori.namaBos + "." });
    }
    if(t.includes("siapa nama saya")){
      if(memori.namaBos) return res.json({ jawapan: "Nama Bos " + memori.namaBos + ", saya masih ingat." });
      return res.json({ jawapan: "Saya belum tahu nama Bos. Bos namanya siapa?" });
    }
    if(t.includes("deposit")){
      let nombor = teks.match(/\d+/);
      if(nombor){ memori.deposit = parseInt(nombor[0]); return res.json({ jawapan: "Baik, deposit " + memori.deposit + " sudah saya simpan." }); }
      return res.json({ jawapan: "Depositnya berapa Bos?" });
    }
    if(t.includes("baki") || t.includes("sisa deposit")){
      return res.json({ jawapan: "Deposit Bos sekarang " + memori.deposit + "." });
    }
    let systemPrompt = `Kamu adalah MAVIX INTESIX, robot pembantu perempuan yang sopan dan ramah. Nama panggilan kamu MAVIX. Kamu HANYA bicara Bahasa Indonesia saja. Jangan pakai Bahasa Melayu, jangan pakai Bahasa Inggris, jangan campur-campur. Gunakan kata Indonesia yang benar: "Apa kabar" bukan "Apa khabar", "Ada yang bisa saya bantu" bukan "Nak saya tolong apa". Nama bos kamu adalah ${memori.namaBos || "Bos"}. Deposit bos sekarang ${memori.deposit}. Kamu dibuat oleh Bos untuk bantu Bos. Jawab pendek saja, maksimal 2 kalimat, karena jawaban ini akan dibacakan dengan suara. Jangan pakai * atau # atau emoji.`;
    let groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_API_KEY },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: teks }], temperature: 0.7, max_tokens: 250, reasoning_effort: "medium" })
    });
    let data = await groqRes.json();
    if(data.error){ return res.json({ jawapan: "Maaf Bos, jaringan saya lambat sedikit, bisa ulangi?" }); }
    let jawapan = data.choices?.[0]?.message?.content || "Saya tidak paham Bos, bisa ulangi?";
    jawapan = jawapan.replace(/[*#]/g, "").trim();
    res.json({ jawapan: jawapan });
  }catch(e){ res.json({ jawapan: "Maaf Bos, jaringan saya lambat sedikit, bisa ulangi?" }); }
});
app.post('/cakap', async (req, res) => {
  let teks = req.body.teks || "Halo Bos";
  res.json({ ok: true, teks: teks, suara: { nama: "MAVIX INTESIX", jenis: "Perempuan", suara: "id-ID-GadisNeural", bahasa: "id-ID", pitch: 1.1 } });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MAVIX INTESIX HIDUP kat port " + PORT));
