const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const KUNCI_GROQ = process.env.GROQ_API_KEY;

const TIPE = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url === '/tes') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "hidup", pesan: "MAVIX sudah hidup Bos!" }));
    return;
  }

  if (req.url === '/cek-groq') {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KUNCI_GROQ },
        body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: "halo" }], max_tokens: 10 })
      });
      const data = await r.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status_code: r.status, groq_jawab: data }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status_code: "FETCH GAGAL", error: e.message }));
    }
    return;
  }

  if (req.url === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const j = JSON.parse(body || '{}');
        const pesanUser = j.message || "halo";
        // INI TAMBALAN BOS - BIAR GROQ TIDAK AMNESIA
        const namaBos = j.namaBos || "";
        const kesukaanBos = j.kesukaan || "";
        const perasaanBos = j.perasaan || "";
        let ingatanUntukGroq = "";
        if (namaBos && namaBos !== "Bos") ingatanUntukGroq += "Nama Bos adalah " + namaBos + ". ";
        if (kesukaanBos) ingatanUntukGroq += "Bos suka " + kesukaanBos + ". ";
        if (perasaanBos) ingatanUntukGroq += "Terakhir Bos merasa " + perasaanBos + ". ";

        if (!KUNCI_GROQ) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply: "Bos, GROQ_API_KEY saya belum dipasang di Render." }));
          return;
        }
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + KUNCI_GROQ },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: "Kamu adalah MAVIX, asisten setia milik Bos. Bicara Bahasa Indonesia, gaya santai, akrab, sopan, selalu panggil Bos dengan sebutan Bos. Jangan pakai simbol markdown seperti **, ###, atau ```. Jangan tulis nomor telepon atau link WA. Otak Kecil sudah menangani sapaan, jam, stop, dan terima kasih. Jadi kamu fokus ke pertanyaan berat, curhat, dan ingatan. Ingatan tentang Bos: " + ingatanUntukGroq },
              { role: "user", content: pesanUser }
            ],
            max_tokens: 1500, temperature: 0.7
          })
        });
        const data = await r.json();
        let jawaban = "Groq putus Bos.";
        if (data.choices && data.choices[0]) {
          jawaban = data.choices[0].message.content.replace(/\*\*/g, "").replace(/###/g, "").replace(/```/g, "").trim();
        } else if (data.error) {
          jawaban = "GROQ bilang: " + JSON.stringify(data.error).slice(0, 300);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: jawaban }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: "Bos, Groq saya putus sebentar: " + e.message }));
      }
    });
    return;
  }

  if (req.url.startsWith('/suara')) {
    try {
      const { EdgeTTS } = require('node-edge-tts');
      const url = new URL(req.url, 'http://x');
      let teks = (url.searchParams.get('teks') || "").substring(0, 800);
      if (!teks) { res.writeHead(400); res.end('tidak ada teks'); return; }
      const tts = new EdgeTTS({ voice: 'id-ID-GadisNeural', lang: 'id-ID' });
      const fileTmp = path.join(os.tmpdir(), 'mavix-' + Date.now() + '.mp3');
      await tts.ttsPromise(teks, fileTmp);
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes' });
      fs.createReadStream(fileTmp).pipe(res).on('finish', () => { try { fs.unlinkSync(fileTmp); } catch(e){} });
    } catch (e) {
      res.writeHead(500); res.end('gagal suara: ' + e.message);
    }
    return;
  }

  let file = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
  let filePath = path.join(__dirname, file);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Tidak jumpa'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': TIPE[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log('MAVIX jalan di ' + PORT));
