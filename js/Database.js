	
const sqlite3 = require('sqlite3').verbose();

class Database {
  
    constructor(){
       this.open();
       this.init();
    }

    open(){
        const path = require('path');
        const dbPath = path.resolve(__dirname, '../db/prices.db')
        console.log(dbPath);
        
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
              console.error(err.message);
            }
            console.log('Connected to the prices database.');
          });
    }

    close(){
        this.db.close();
    }

    init(){
        this.db.run('CREATE TABLE IF NOT EXISTS bitcoin(info text)'); 
        this.db.run('CREATE TABLE IF NOT EXISTS operations(info text)');
    }

    insert(info){
        var values = [JSON.stringify(info)];
        var sql = 'INSERT INTO bitcoin (info) VALUES ( ? )' ;
        this.db.run(sql,values,function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            //console.log(`A row has been inserted with rowid ${this.lastID}`);
          });
    }
    insertOperation(info){
      var values = [JSON.stringify(info)];
      var sql = 'INSERT INTO operations (info) VALUES ( ? )' ;
      this.db.run(sql,values,function(err) {
          if (err) {
            return console.log(err.message);
          }
          // get the last insert id
          //console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
  }
    getAll(){
     
      return new Promise((function(resolve, reject) {
        this.db.all( `SELECT info info FROM bitcoin`,(err, rows) => {
            if (err) {
              reject(err);
            } else {
              const prices = [];
              for (const row of rows) {
                const price = JSON.parse(row.info);
                prices.id = row.id;
                prices.push(price);
              }
              resolve(prices);
            }
          })
      }.bind(this)));
      
    }
    getHead(n){
     
      return new Promise((function(resolve, reject) {
        this.db.all( `SELECT info info FROM bitcoin`,(err, rows) => {
            if (err) {
              reject(err);
            } else {
              const prices = [];
              for (const row of rows) {
                const price = JSON.parse(row.info);
                prices.id = row.id;
                prices.push(price);
              }
              resolve(prices.slice(prices.length-n,prices.length));
            }
          })
      }.bind(this)));
      
    }
}
module.exports = new Database();