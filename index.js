const express = require('express')

const BitsoApi  = require('./js/BitsoApI');
const EmaAgent = require('./js/EmaAgent.js')
const bitsoApi = new BitsoApi(false);
const emaAgent = new EmaAgent(24,200);
emaAgent.feed = emaAgent.feed.bind(emaAgent);
const database  = require('./js/Database');

const app = express()

app.get('/', function (req, res) {

    bitsoApi.getBitcoinPrice().then(resp=>{
        res.send(resp)
    })   

})
app.get('/start', function (req, res) {
    bitsoApi.startSavingPrice();
    res.send(true);
})

app.get('/stop', function (req, res) {
    bitsoApi.stopSavingPrice();
    res.send(true);
})

app.get('/getAll', function (req, res) {
    database.getAll().then(resp=>{
        res.send(resp);
    })
})
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')

//   bitsoApi.getBalance().then((data)=>console.log("from api",JSON.stringify(data)));
     bitsoApi.startSavingPrice(emaAgent.feed);

})
// TODO  FUNCTION  GET DATA (PRECIOS HISTORICOS DE BITCOIN)
// TODO  FUNCTION GET INFO ACCOUNT
// TODO  FUNCTION GET MOVEMENTS ( LO HECHO POR LA APP)
// TODO  FUNCTION STOP
// TODO  FUNCTION GET TODAYS INFO (DISPERCION, PRECIO.. ETC)