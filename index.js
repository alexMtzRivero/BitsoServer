const express = require('express')

const BitsoApi  = require('./js/BitsoApi');
const bitsoApi = new BitsoApi(false);

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
  
})
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
  bitsoApi.getBalance().then((data)=>console.log("from api",JSON.stringify(data)));
  bitsoApi.startSavingPrice();

})
// TODO  FUNCTION  GET DATA (PRECIOS HISTORICOS DE BITCOIN)
// TODO  FUNCTION GET INFO ACCOUNT
// TODO  FUNCTION GET MOVEMENTS ( LO HECHO POR LA APP)
// TODO  FUNCTION STOP
// TODO  FUNCTION GET TODAYS INFO (DISPERCION, PRECIO.. ETC)