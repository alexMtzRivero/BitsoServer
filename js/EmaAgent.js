const BitsoApI = require('./BitsoApI')
const bitso = new BitsoApI(false);
module.exports = class EmaAgent {
  constructor(shortEmaN, investUnit) {
    this.investUnit = investUnit
    this.position = 0;
    this.shortEmaN = shortEmaN;
    this.investment = 0;
    this.satoshi = 0;
    this.BUYS = 0;
    this.PBUYS = 0;
    this.SELLS = 0;
    this.PSELLS = 0;
    this.tax = 0;
    this.pointer = 0;
    this.data = [];
    this.shortEma = 0;
  }

  feed(input) {
    var ask = Number(input.ask)
    var bid = Number(input.bid)
    var cPrise = (ask + bid) / 2;
    var active = true
    var calculedPrice = cPrise / this.shortEmaN
    // if its alredy counting discount the price 
    if (!isNaN(this.data[this.pointer])) {
      this.shortEma -= this.data[this.pointer];
    } else {
      active = false;
      console.log(`we dont do anithing because we have only ${this.data.length} minutes`);
      
    }

    //overwrite the data in the array an adit to the ema
    this.data[this.pointer] = calculedPrice;
    this.shortEma += calculedPrice;
    //if the array is already full we canbegin to buy or sell
    if (active){

      //TODO  optimize to act with movements of bid and ask
        console.log(`waiting for ema: ${this.shortEma} to be ${(this.position===0) ? `> than ${cPrise} to sell` : `< than ${cPrise} to buy` }`);
        //if the price was down but now is smaler than the ema
        if (this.position === 0 && this.shortEma > cPrise) {
          this.sell(bid);
          this.position = 1;
        }

        //if the price was up but now is bigger than the ema
        else 
        if (this.position === 1 && this.shortEma < cPrise) { 
          this.buy(ask);
          this.position = 0;
        }
      }

    // continue with the circuar list
    this.pointer++;
    this.pointer %= this.shortEmaN;
  }



  buy(cPrise) {
    // this.realBuy(this.investUnit,cPrise)
    const realPrice = cPrise ;
    this.investment += this.investUnit;
    this.satoshi += this.investUnit / realPrice;
    this.BUYS++;
    this.tax += this.investUnit * 0.0067;
    this.PBUYS +=  this.investUnit * (1 - 0.0067 );
  }
  sell(cPrise) {
    // this.realSell(this.investUnit,cPrise)
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
    return this.investment +
      (this.satoshi * cPrice)
  }
}