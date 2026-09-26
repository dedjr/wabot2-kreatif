require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'pilihev123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // 1309777982225882

// Buat cek hidup di Railway
app.get('/', (req,res)=> res.send('EV Bot V3 OK'));

// INI YANG BIKIN VERIFY AND SAVE HIJAU
app.get('/webhook', (req,res)=>{
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log('VERIFY:', mode, token);
  if(mode === 'subscribe' && token === VERIFY_TOKEN){
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Terima pesan WA
app.post('/webhook', async (req,res)=>{
  try{
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const msg = value?.messages?.[0];

    if(msg){
      const from = msg.from;
      const text = msg.text?.body?.toLowerCase() || '';
      console.log('Pesan dari', from, ':', text);

      let reply = `Halo kak! EV Bot V3 aktif 🟢\n\nKetik:\n1 = Cek stok\n2 = Harga baterai\n3 = Alamat toko`;

      if(text.includes('1')) reply = 'Stok Kreatif Elektronik aman. Mau tipe apa?';
      if(text.includes('2')) reply = 'Baterai EV mulai 350rb. Tipe?';

      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },{
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
    }
    res.sendStatus(200);
  }catch(e){
    console.error(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Bot jalan di port', PORT));
