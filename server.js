const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');
const { getTranscript } = require('youtube-transcript');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAIApi(new Configuration({
  apiKey: "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"
}));

const TELEGRAM_TOKEN = "8051593906:AAFeMij6V_XGMcRsL1Jkf5XpP_P3VAKo0Mo";
const CHAT_ID = "6374002294";

app.post("/summarize", async (req, res) => {
  const { nama, link } = req.body;

  try {
    const items = await getTranscript(link);
    const teks = items.map(x => x.text).join(" ").slice(0, 4000);

    const summary = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Ringkas video ini:\n${teks}` }]
    });

    const hasil = summary.data.choices[0].message.content;

    const kirim = `👋 Halo ${nama}\n\nBerikut ringkasan video kamu:\n\n${hasil}`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: kirim })
    });

    res.json({ message: "Ringkasan berhasil dikirim ke Telegram!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ringkas atau kirim. Cek log server." });
  }
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));
