class OrderTable {
    public serial: number;
    public order: number[];

    constructor(serial: number, order: number[]) {
        this.serial = serial;
        this.order = order;
    }
}

class OrderManager extends OrderTable {
    public payment: number;
    public receptionTime: number;
    money: number;

    constructor(payment: number, serial: number, order: number[]) {
        super(serial, order);
        this.payment = payment;
        this.receptionTime = Date.now();
        this.money = this.MoneyCalc();
    }

    MoneyCalc(): number {
        return 0;
    };

    makeSendFile() {
        //ここの記述、動作が怪しいので注意
        //OrderTableの変数のみ取り出したい
        const test: OrderTable = this;
    }
}



export default OrderManager;