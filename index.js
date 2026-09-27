require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const 【entity-axios¦canonical_name=axios】 = require('【entity-axios¦canonical_name=axios】');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// MEMORY biar nyambung kayak chat sama aku
const chats = new Map();
function getHistory(from){
  if(!chats.has(from)) chats.set(from, []);
  return chats.get(from);
}

app.get('/', (req,res)=> res.send('EV Bot V3 Natural + Hermes OK'));

app.get('/webhook', (req,res)=>{
  if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN){
    return res.status(200).send(req.query['hub.challenge']);
  }
  return res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
  try{
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!msg) return res.sendStatus(200);

    const from = msg.from;
    const text = msg.text?.body || '';

    // ambil history
    let history = getHistory(from);
    history.push({ role: "user", content: text });
    if(history.length > 12) history = history.slice(-12);

    let replyText = "";

    try{
      const r = await 【entity-axios¦canonical_name=axios】.post(process.env.HERMES_API_URL, {
        messages: history,
        user_id: from,
        system_prompt: `
Kamu adalah CS Kreatif Elektronik Bandar Lampung.
Gaya: ramah, santai, natural kayak teman ngobrol, pakai "kak", bahasa Indonesia sehari-hari.
Jangan jawab pakai list 1,2,3 kecuali user minta menu.
Jawab pendek, to the point, helpful, jangan formal, jangan bilang "Sebagai AI".
Kalau ditanya stok baterai, jawab santai: "ready kak, mau 72V 20Ah atau 60V?"
Kalau gak tau, bilang "aku cek dulu ya kak" jangan ngarang.
Pakai 1 emoji aja kalau perlu.
`
      },{
        headers: { Authorization: `Bearer ${process.env.HERMES_API_KEY}` },
        timeout: 20000
      });
      replyText = r.data.reply || r.data.answer || r.data.output || r.data.message;
      history.push({ role: "assistant", content: replyText });
      chats.set(from, history);

    }catch(e){
      console.log("Hermes error:", e.message);
      replyText = "Halo kak! Aku online nih 🟢 Mau cek stok baterai yang mana?";
    }

    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: from,
      text: { body: replyText }
    },{
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });

    res.sendStatus(200);
  }catch(err){
    console.error(err.message);
    res.sendStatus(200);
  }
});

app.listen(process.env.PORT || 3000, ()=> console.log("Natural bot jalan"));
