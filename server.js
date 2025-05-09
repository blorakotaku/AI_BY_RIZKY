const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

let client;

app.use(express.static('public'));
app.use(bodyParser.json());

let telegramToken = "";
let telegramChatId = "";

function notifyTelegram(message) {
  if (telegramToken && telegramChatId) {
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text: message })
    });
  }
}

app.post('/set-telegram', (req, res) => {
  telegramToken = req.body.token;
  telegramChatId = req.body.chatId;
  notifyTelegram("Bot WhatsApp berhasil terhubung ke Telegram.");
  res.json({ status: "Telegram token disimpan" });
});

app.get('/start-qr', async (req, res) => {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: "panel" }),
  });

  client.on('qr', async qr => {
    const qrImage = await qrcode.toDataURL(qr);
    res.json({ qr: qrImage });
  });

  client.on('ready', () => {
    console.log("Bot siap!");
    notifyTelegram("Bot WhatsApp sudah siap digunakan!");
  });

  client.initialize();
});

app.post('/login-code', (req, res) => {
  const sessionData = JSON.parse(Buffer.from(req.body.code, 'base64').toString());
  fs.writeFileSync('./backend/session.json', JSON.stringify(sessionData));

  client = new Client({ session: sessionData });

  client.on('ready', () => {
    console.log("Bot siap dari kode!");
    notifyTelegram("Bot WhatsApp aktif via kode!");
  });

  client.initialize();
  res.json({ status: "Bot aktif via kode" });
});

app.get('/login-file', (req, res) => {
  const sessionData = require('./session.json');

  client = new Client({ session: sessionData });

  client.on('ready', () => {
    console.log("Bot siap dari file!");
    notifyTelegram("Bot WhatsApp aktif via file!");
  });

  client.initialize();
  res.json({ status: "Bot aktif via file" });
});

app.listen(PORT, () => {
  console.log(`Panel aktif di http://localhost:${PORT}`);
});