module.exports= class DataConsumer {
    constructor(){
        this.pricesWs = 0;
    }

    startWS(types){
        this.pricesWs = new WebSocket('wss://ws.coincap.io/prices?assets='+`${types}`)

       
        // TODO: guardar en sql para genera datos propios
    }
    setOnMessage(funct){
        this.pricesWs.onmessage = funct;
    }
    stopWS(){
        this.pricesWs.close();
    }
   
}

 