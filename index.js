const express = require('express');
const 【entity-axios¦canonical_name=axios】 = require('【entity-axios¦canonical_name=axios】');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'meta123';
const PHONE_NUMBER_ID = '1395377830314050';
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token === VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const value = req.body.entry && req.body.entry[0] && req.body.entry[0].changes[0] && req.body.entry[0].changes[0].value;
    const msg = value && value.messages && value.messages[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text && msg.text.body? msg.text.body : 'media';
      await 【entity-axios¦canonical_name=axios】.post(
        'https://graph.facebook.com/v20.0/' + PHONE_NUMBER_ID + '/messages',
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: 'Kamu kirim: ' + text + ' - bot aktif' }
        },
        {
          headers: { Authorization: 'Bearer ' + ACCESS_TOKEN }
        }
      );
    }
  } catch (e) {
    console.log(e.response? e.response.data : e.message);
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('running on ' + PORT));
