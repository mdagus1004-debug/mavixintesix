const express = require('express');
const app = express();
app.use(express.json());

const GROQ_KEY = process.env.GROQ_API_KEY;

// NI YANG BOS TAK ADA TADI, KITA TAMBAH NI!
app.get('/', (req, res) => {
  res.send("MAVIX DAH HIDUP BOS! GROQ Dah Jalan!");
});

app.post('/chat', async (req, res) => {
  const pesanUser = req.body.message || "halo";
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: pesanUser }],
        max_tokens: 1000
      })
    });
    const data = await r.json();
    console.log("GROQ JAWAB:", JSON.stringify(data).slice(0, 500));
    if (data.choices && data.choices[0]) {
      return res.json({ reply: data.choices[0].message.content });
    } else {
      return res.json({ reply: "GROQ cakap: " + JSON.stringify(data.error || data).slice(0, 300) });
    }
  } catch (e) {
    return res.json({ reply: "GROQ putus: " + e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("MAVIX Hidup di port " + PORT));
