const express = require('express')

const BitsoApi  = require('./js/BitsoApI');
const EmaAgent = require('./js/EmaAgent.js')
const bitsoApi = new BitsoApi(false);
const emaAgent = new EmaAgent(10,270,200,true);
emaAgent.feed = emaAgent.feed.bind(emaAgent);
emaAgent.initPrices = emaAgent.initPrices.bind(emaAgent);
const database  = require('./js/Database');

const app = express()

app.get('/', function (req, res) {

    bitsoApi.getBitcoinPrice().then(resp=>{
        res.send(resp)
    })   

})

app.get('/startListener', function (req, res) {
    bitsoApi.startSavingPrice(emaAgent.feed);
    res.send(true);
})

app.get('/stopListener', function (req, res) {
    bitsoApi.stopSavingPrice();
    res.send(true);
})

app.get('/agentStatus', function (req, res) {
    res.send(emaAgent);
})
app.get('/getAll', function (req, res) {
    database.getAll().then(resp=>{
        res.send(resp);
    })
})

app.get('/startTrader', function (req, res) {
    emaAgent.test = false;
    res.send(true);
})

app.get('/stopTrader', function (req, res) {
    emaAgent.test = false;
    res.send(true);
})

app.get('/balance', function (req, res) {
    bitsoApi.getBalance().then(result =>{
        res.send(result);
    });
   
})

//TODO CHANGE TRADE TO UNIT ADD/SUBSTRACT


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')

  database.getHead().then(resp=>{
    emaAgent.initPrices(resp);
})

//   bitsoApi.getBalance().then((data)=>console.log("from api",JSON.stringify(data)));

})
// TODO  FUNCTION  GET DATA (PRECIOS HISTORICOS DE BITCOIN)

// TODO  FUNCTION GET MOVEMENTS ( LO HECHO POR LA APP)

// TODO  FUNCTION GET TODAYS INFO (DISPERCION, PRECIO.. ETC)