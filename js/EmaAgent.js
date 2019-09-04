const BitsoApI = require('./BitsoApI')
const bitso = new BitsoApI(false);
//TODO uncoment realbuy/sell and logs
module.exports = class EmaAgent {
  constructor(shortEmaN,longEmaN,investUnit ,test) {
    //operational data
    this.test = test;
    this.investUnit = investUnit
    this.position = 0;
    
    this.longEmaN = longEmaN;
    this.shortEmaN = shortEmaN;

    //statistcal data
    this.investment = 0;
    this.satoshi = 0;
    this.BUYS = 0;
    this.PBUYS = 0;
    this.SELLS = 0;
    this.PSELLS = 0;
    this.tax = 0;

    // algoritmical data
    this.pointerLong = 0;
    this.pointerShort = 0;

    this.dataEma = [];
    this.dataAsk = [];
    this.dataBid = [];

    this.longEma = 0;
    this.shortEmaAsk = 0;
    this.shortEmaBid = 0;
  
  }

  feed(input) {
    var operationInfo = {};

    var ask = Number(input.ask);
    var bid = Number(input.bid);

    const calculedAsk = ask/this.shortEmaN;
    const calculedBid = bid/this.shortEmaN;

    var active = true
    var cPrise = (ask+bid)/2
    var calculedPrice = cPrise / this.longEmaN

    // if its alredy counting discount the price 
    if (!isNaN(this.dataAsk[this.pointerShort])) {
      // info for returning on graph
      operationInfo.shortEmaAsk = this.shortEmaAsk;
      operationInfo.shortEmaBid = this.shortEmaBid;
      
      this.shortEmaAsk -= this.dataAsk[this.pointerShort];
      this.shortEmaBid -= this.dataBid[this.pointerShort];
    }
    
    // if its alredy counting discount the price 
    if (!isNaN(this.dataEma[this.pointerLong])) {
      // info for returning on graph
      operationInfo.longEma = this.longEma
      
      this.longEma -= this.dataEma[this.pointerLong];
    } else {
      active = false;
      //if(!this.test) console.log(`we dont do anithing because we have only ${this.dataEma.length} minutes`);  
    }

    //overwrite the data in the array an add it to the ema
    this.dataEma[this.pointerLong] = calculedPrice;
    this.longEma += calculedPrice;

    this.dataAsk[this.pointerShort] = calculedAsk;
    this.shortEmaAsk += calculedAsk;

    this.dataBid[this.pointerShort] = calculedBid;
    this.shortEmaBid += calculedBid;
    
    //if the array is already full we canbegin to buy or sell
    if (active){

     // if(!this.test)console.log(`waiting for ema: ${this.longEma} to be ${(this.position===0) ? `> than ${cPrise} to sell` : `< than ${cPrise} to buy` }`);
        //if the price was down but now is smaler than the ema
        if (this.position === 0 && this.longEma > this.shortEmaAsk) {
          this.sell(bid);
          this.position = 1;
          operationInfo.sell = true;
        }

        //if the price was up but now is bigger than the ema
        else 
        if (this.position === 1 && this.longEma < this.shortEmaBid) { 
          this.buy(ask);
          this.position = 0;
          operationInfo.buy = true;
        }
      }

    // continue with the circuar list
    this.pointerLong++;
    this.pointerLong %= this.longEmaN;

    this.pointerShort++;
    this.pointerShort %= this.shortEmaN;

    return operationInfo;
  }



  buy(cPrise) {
    if(!this.test)this.realBuy(this.investUnit,cPrise)
    const realPrice = cPrise ;
    this.investment += this.investUnit;
    this.satoshi += this.investUnit / realPrice;
    this.BUYS++;
    this.tax += this.investUnit * 0.0067;
    this.PBUYS +=  this.investUnit * (1 - 0.0067 );
  }
  sell(cPrise) {
    if(!this.test) this.realSell(this.investUnit,cPrise)
    const realPrice = cPrise;
    this.investUnit = (this.satoshi!=0)?(this.satoshi * realPrice ):( this.investUnit);
    this.investment -= this.investUnit;
    this.satoshi = 0;
    this.SELLS++;
    this.tax += this.investUnit * 0.0067;
    this.PSELLS +=  this.investUnit * (1 - 0.0067 );
  }
  realBuy(minorQuantity, price) {
    var bitcoin = minorQuantity / price;
    // orden para comprar 0.075 bitcoin cuando cueste 500.00 pesos cada bitcoin
    bitso.postOrder("btc_mxn", "buy", "limit", bitcoin.toFixed(8), null, `${price}`, null).then(resp => {
      console.log(`comprando ${bitcoin}btc a ${price}mxn gastando ${minorQuantity}mxn conrespuesta: `, resp);
    });
  }
  realSell(minorQuantity, price) {
    var bitcoin = minorQuantity / price;
    // orden para vender 0.075 bitcoin cuando cueste 500.00 pesos cada bitcoin
    bitso.postOrder("btc_mxn", "sell", "limit", bitcoin.toFixed(8), null, `${price}`, null).then(resp => {
      console.log(`vendiendo ${bitcoin}btc a ${price}mxn ganando ${minorQuantity}mxn conrespuesta: `, resp);

    });
  }
  getState(cPrice) {
    return this.PSELLS-this.PBUYS +(this.satoshi * this.dataBid[this.pointerShort] * this.shortEmaN)
  }
  getGraph(data){
    
    var lastTest = this.test;
    this.test = true;

    var response = [];
    // ema ask
    response[0] = []
    //ema general
    response[1] = []
    //ema bid
    response[2] = []
    // buys
    response[3] = []
    // sells
    response[4] = []

   

    for (let i = 0; i < data.length; i++) {
    const operationInfo = this.feed(data[i]);

    if(operationInfo.shortEmaAsk)response[0].push({"x":i,"y":operationInfo.shortEmaAsk});
    if(operationInfo.longEma)response[1].push({"x":i,"y":operationInfo.longEma});
    if(operationInfo.shortEmaBid)response[2].push({"x":i,"y":operationInfo.shortEmaBid});
    if(operationInfo.buy)response[3].push({"x":i,"y":operationInfo.shortEmaAsk});
    if(operationInfo.sell)response[4].push({"x":i,"y":operationInfo.shortEmaBid});


    }
   
    this.test = lastTest;
    return response;
  }
  initPrices(info){
    const  originalState = this.test
    this.test = true;

    info.forEach(minute => {
      this.feed(minute.payload);
    });

    this.investment = 0;
    this.satoshi = 0;
    this.BUYS = 0;
    this.PBUYS = 0;
    this.SELLS = 0;
    this.PSELLS = 0;
    this.tax = 0;
    
    console.log("ema initialized")

    this.test = originalState;
  }
}