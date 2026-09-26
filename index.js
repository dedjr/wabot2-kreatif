const express = require('express');
const app = express();
app.use(express.json());
app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']==='meta123') res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});
app.post('/webhook',(req,res)=>{console.log(req.body);res.sendStatus(200);});
app.get('/',(req,res)=>res.send('ok'));
app.listen(process.env.PORT||3000);
