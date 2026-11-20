const express = require('express');
const app = express();
app.use(express.json());

const GROK_KEY = process.env.GROK_API_KEY;

app.post('/chat', async (req, res) => {
  const pesanUser = req.body.message || "halo";
  
  try {
    const r = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROK_KEY}`
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: pesanUser }],
        max_tokens: 1000
      })
    });

    const data = await r.json();
    console.log("GROK JAWAB:", JSON.stringify(data).slice(0, 500));

    if (data.choices && data.choices[0]) {
      return res.json({ reply: data.choices[0].message.content });
    } else {
      return res.json({ reply: "Bos, Grok cakap: " + JSON.stringify(data.error || data).slice(0, 300) });
    }

  } catch (e) {
    console.log("GROK ERROR:", e.message);
    return res.json({ reply: "Bos, Grok saya putus sebentar: " + e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("MAVIX Hidup di port " + PORT));
