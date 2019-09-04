class Info {
    constructor() {
        if(!Info.instance){
            this.NCrash =0;
            this.NConsumedData = 0;
            this.trading = false;
            this.logs = [];
            Info.instance = this;
        }
    }
}
const instance = new Info();
Object.freeze(instance);
module.exports = instance;