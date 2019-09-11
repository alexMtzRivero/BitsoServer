const express = require('express')
const bodyParser = require("body-parser");

const BitsoApi  = require('./js/BitsoApI');
const EmaAgent = require('./js/EmaAgent.js')
const bitsoApi = new BitsoApi(false);
const emaAgent = new EmaAgent(20,230,200,false);
emaAgent.feed = emaAgent.feed.bind(emaAgent);
emaAgent.initPrices = emaAgent.initPrices.bind(emaAgent);
const database  = require('./js/Database');

const app = express()

app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {

    bitsoApi.getBitcoinPrice().then(resp=>{
        res.send(resp)
    })   

})

app.get('/startListener', function (req, res) {
    console.log("Starting listener");
    bitsoApi.startSavingPrice(emaAgent.feed);
    res.send(true);
})
app.get('/serverInfo', function (req, res) {
    console.log("Sending server info");
    res.send({ "listener" : !bitsoApi.stop,
               "emaActive" : emaAgent.active,
               "emaTest": emaAgent.test
        });
})

app.get('/stopListener', function (req, res) {
    console.log("Stoping listener");
    bitsoApi.stopSavingPrice();
    res.send(true);
})

app.get('/agentStatus', function (req, res) {
    console.log("Sending agent status");
    res.send(emaAgent);
})
app.get('/getAll', function (req, res) {
    console.log("Sending all bitcoin data");
    database.getAll().then(resp=>{
        res.send(resp);
    })
})
app.get('/getMovements', function (req, res) {
    console.log("Sendin all movements");
    database.getMovements().then(resp=>{
        res.send(resp);
    })
})

app.get('/startTrader', function (req, res) {
    console.log("Starting trader");
    emaAgent.test = false;
    res.send(true);
})

app.get('/stopTrader', function (req, res) {
    console.log("Stoping trades");
    emaAgent.test = false;
    res.send(true);
})

app.get('/balance', function (req, res) {
    console.log("Sending user balance");
    bitsoApi.getBalance().then(result =>{
        res.send(result);
    });
   
})

app.post('/tradeUnit', function(request, response) {
    var p1 = request.body.tradeUnit; 
    emaAgent.investUnit = Number(p1);
    console.log("Changin invest unit to: "+ p1);
  });


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')

  database.getHead(emaAgent.longEmaN).then(resp=>{
    emaAgent.initPrices(resp);
    emaAgent.test = false;
    bitsoApi.startSavingPrice(emaAgent.feed);
})
console.log("Agent not in test mode and price listener on");

})
// TODO  FUNCTION  GET DATA (PRECIOS HISTORICOS DE BITCOIN)


// TODO  FUNCTION GET TODAYS INFO (DISPERCION, PRECIO.. ETC)