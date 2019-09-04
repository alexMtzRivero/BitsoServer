//https://bitso.com/api_info?shell#available-books
var crypto = require('crypto');
const  keys = require("../keys.json");
const database  = require('./Database');
const fetch = require('node-fetch')
module.exports = class BitsoAPI {
    constructor(test) {
        this.test = test;
        this.stop = false;
        this.path = `https://api${this.test?'-dev':''}.bitso.com`
    }
    startSavingPrice(){
        this.stop = false;
        this.savePrice();
    }
    savePrice(){
       
            setTimeout(()=>{
                if(!this.stop){
                    this.savePrice();
                    this.getBitcoinPrice().then((data)=>{
                        database.insert(data)
                    }).catch((err)=>{
                        console.error(err);
                        this.stop = true;
                    }); 
                }  
            },1000*600)
        
    }
    stopSavingPrice(){
        console.log("stoping listener");
        
        this.stop = true;
    }
    allBooksInfo() {
        return fetch(`${this.path}/v3/available_books/`).then((resp) => resp.json());
    }
    getBitcoinPrice() {
        return fetch(`${this.path}/v3/ticker/?book=btc_mxn`).then((resp) => resp.json())
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

    getAuthorization(http_method,request_path,body){
        
        var nonce = new Date().getTime();
    
        // Create the signature
        var Data = "" + nonce + http_method + request_path + body;
        
        var signature = crypto.createHmac('sha256', keys.secret).update(Data).digest('hex');
        // Build the auth header
        var auth_header = "Bitso " + keys.key + ":" + nonce + ":" + signature;
        console.log(auth_header);
        
       return   auth_header
          
     
    }
    // TODO CANCEL ORDER

}