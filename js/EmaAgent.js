const BitsoApI = require('./BitsoApI')
const bitso = new BitsoApI(false);
module.exports = class EmaAgent {
  constructor(shortEmaN, investUnit) {
    this.investUnit = investUnit
    this.position = 1;
    this.shortEmaN = shortEmaN;
    this.investment = 0; 
    this.satoshi = 0;
    this.BUYS = 0;
    this.PBUYS =  0;
    this.SELLS = 0;
    this.PSELLS = 0;
    this.tax = 0;
    this.pointer = 0;
    this.data = [];
    this.shortEma = 0;
  }

  feed(input) {
        var ask =Number(input.ask)
        var bid = Number(input.bid)
        var cPrise = (ask+ bid)/2 ;
        var calculedPrice = cPrise / this.shortEmaN
        // if its alredy counting discount the price 
        if (!isNaN( this.data[this.pointer])) {
          this.shortEma -= this.data[this.pointer];
        }

        //overwrite the data in the array an adit to the ema
        this.data[this.pointer] = calculedPrice;
        this.shortEma += calculedPrice;

        //if the price was down but now is grater than the ema
        if (this.position === 0 && this.shortEma < bid) {
          this.position = 1;
          this.sell(bid);
        }
        
        //if the price was up but now is smaller than the ema
        if (this.position === 1 && this.shortEma > ask) {
          this.buy(ask);
          this.position = 0;
        }

        // continue with the circuar list
        this.pointer++;
        this.pointer%= this.shortEmaN;
      }

  

  buy( cPrise){
    this.realBuy(this.investUnit,cPrise)
    const realPrice = cPrise * 1.01;
    this.investment += this.investUnit;
    this.satoshi += this.investUnit / realPrice;
    this.BUYS++;
    this.PBUYS += realPrice;
    this.tax += cPrise * 0.1;
  }
  sell(cPrise){
    this.realSell(this.investUnit,cPrise)
    const realPrice = cPrise * 0.99;
    this.investment -= this.satoshi * realPrice;
    this.investUnit = this.satoshi * realPrice;
    this.satoshi = 0 ;
    this.SELLS ++;
    this.PSELLS += realPrice;
    this.tax += cPrise * 0.1;
  }
  realBuy(minorQuantity, price){
    var bitcoin   = minorQuantity / price;
    // orden para comprar 0.075 bitcoin cuando cueste 500.00 pesos cada bitcoin
    bitso.postOrder("btc_mxn","buy","limit",bitcoin.toFixed(8),null,`${price}`,null).then(resp=>{
      console.log(`comprando ${bitcoin}btc a ${price}mxn gastando ${minorQuantity}mxn conrespuesta: `, resp);
      
    });
  }
  realSell(minorQuantity, price){
    var bitcoin   = minorQuantity / price;
    // orden para vender 0.075 bitcoin cuando cueste 500.00 pesos cada bitcoin
    this.bitso.postOrder("btc_mxn","sell","limit",bitcoin.toFixed(8),null,`${price}`,null).then(resp=>{
      console.log(`vendiendo ${bitcoin}btc a ${price}mxn ganando ${minorQuantity}mxn conrespuesta: `, resp);
      
    });
  }
  getState(cPrice){
    return this.investment +
     (this.satoshi * cPrice)
  }
}