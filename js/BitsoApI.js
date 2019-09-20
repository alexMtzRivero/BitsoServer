//https://bitso.com/api_info?shell#available-books
var crypto = require('crypto');
const  keys = require("../keys.json");
const database  = require('./Database');
const fetch = require('node-fetch')

const tickers = [
    {ticker:"btc_mxn",name:"bitcoin"},
{ticker:"eth_mxn",name:"ether"},
{ticker:"xrp_mxn",name:"ripple"},
{ticker:"ltc_mxn",name:"litecoin"},
{ticker:"tusd_mxn",name:"dollar"}]
module.exports = class BitsoAPI {
    constructor(test) {
        this.index = 0;
        this.test = test;
        this.stop = true;
        this.path = `https://api${this.test?'-dev':''}.bitso.com`
    }
    startSavingPrice(callback){
        if(this.stop){
            this.stop = false;
            this.savePrice(callback);
        }
    }
    savePrice(callback){
       if(!this.stop){ 
            this.getBitcoinPrice(tickers[this.index].ticker).then((data)=>{
                database.insert(data,tickers[this.index].name);
                callback(data.payload);
                this.index++;
                this.index %= 5;
            }).catch((err)=>{
                console.error(err);
            }); 

            setTimeout(()=>{
                        this.savePrice(callback)
                    },1000*60*2) ;
        }  
           
        
    }
    stopSavingPrice(){
        console.log("stoping listener");
        
        this.stop = true;
    }
    allBooksInfo() {
        return fetch(`${this.path}/v3/available_books/`).then((resp) => resp.json());
    }
    getBitcoinPrice(ticker) {
        return fetch(`${this.path}/v3/ticker/?book=${ticker}`).then((resp) => resp.json())
    }
    
    getBalance(){
        var o = {
            method: "GET" ,  
            headers: {
                  'Authorization':this.getAuthorization("GET","/v3/balance",'')
              }
          };
          
        return fetch(`${this.path}/v3/balance`,o).then((result)=>result.json())
    }
       /**
     * place an order
     *  book	-	Yes	Specifies which book to use
        side	-	Yes	The order side (buy, sell)
        type	-	Yes	The order type (market, limit)
        major	-	No	The amount of major currency for this order. An order must be specified in terms of major or minor, never both.
        minor	-	No	The amount of minor currency for this order. An order must be specified in terms of major or minor, never both.
        price	-	No	Price per unit of major. For use only with limit orders
        stop	-	No	Price per unit of major at which to stop and place order. For use only with stop orders.
        time_in_force	-	No	Indicates how long a limit order will remain active before it is executed or expires (goodtillcancelled, fillorkill, immediateorcancel)
   
     */
    postOrder(book,side,type,major,minor,price,stop){
        var body = {};
        var valid = true;

        if(book) body.book = book;
        else valid = false;
        if(side) body.side = side;
        else valid = false;
        if(type) body.type = type;
        else valid = false;

        if(major && minor) valid = false;

        if(major) body.major = major;
        if(minor) body.minor = minor;
        if(price) body.price = price;
        if(stop) body.stop = stop;

        body.time_in_force = "goodtillcancelled"//"immediateorcancel";

        if( valid ){
            //send request
            //POST https://api.bitso.com/v3/orders/
            const stringBody = JSON.stringify(body)
            console.log(stringBody);
            
            database.insertOperation(stringBody)
            var o = {
                method: "POST" ,  
                headers: {
                      'Authorization':this.getAuthorization("POST","/v3/orders",stringBody),
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                  },
                body: stringBody
              };
              
            return fetch(`${this.path}/v3/orders`,o).then((result)=>result.json()
            ).then((data)=> {return data})
        }

}
getMovements(){
    var o = {
        method: "GET" ,  
        headers: {
              'Authorization':this.getAuthorization("GET","/v3/balance",'')
          }
      };
      
    return fetch(`${this.path}/v3/ledger/trades`,o).then((result)=>result.json())
   
}

    getAuthorization(http_method,request_path,body){
        
        var nonce = new Date().getTime();
    
        // Create the signature
        var Data = "" + nonce + http_method + request_path + body;
        
        var signature = crypto.createHmac('sha256', keys.secret).update(Data).digest('hex');
        // Build the auth header
        var auth_header = "Bitso " + keys.key + ":" + nonce + ":" + signature;
        //console.log(auth_header);
        
       return   auth_header
          
     
    }
    // TODO CANCEL ORDER

}