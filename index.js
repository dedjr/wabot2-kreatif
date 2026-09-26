const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'meta123';
const PHONE_NUMBER_ID = '1395377830314050'; // ID yang bener dari screenshot kamu
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN; // EAA... yang tadi di Firefox

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log('INCOMING:', JSON.stringify(req.body, null, 2));

  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    if (msg) {
      const from = msg.from; // nomor pengirim 62852...
      const text = msg.text?.body || 'media';

      console.log(`Balas ke ${from}: ${text}`);

      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: `Kamu kirim: ${text} - bot aktif ✅\n\nToken EAA aman, Railway nyambung!` }
        },
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );
    }
  } catch (e) {
    console.log('ERROR KIRIM:', e.response?.data || e.message);
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('ok - bot jalan'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('running on ' + PORT));
