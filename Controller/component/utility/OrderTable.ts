/**
 * 注文に関するクラス
 */
export class OrderTable {
    /**
     * 注文内容
     */
    order: Flag[];
    serial: number;
    casherId: number;
    receptionTime: number;
    paymentType: number;
    price: number;

    /**
     * 受付番号
     */
    get Serial(): number {
        return this.serial
    }
    /**
     * 注文を受け取った従業員の固有番号
     */
    get CasherId(): number {
        return this.casherId;
    }
    /**
     * 注文受付時間
     */
    get ReceptionTime(): number {
        return this.receptionTime;
    }
    /**
     * 支払い方法
     */
    get PaymentType(): number {
        return this.paymentType;
    }


    constructor(serial: number, casherId: number, paymentType: number) {
        this.serial = serial;
        this.casherId = casherId;
        this.paymentType = paymentType;
        this.receptionTime = Date.now();
        this.order = [];
        this.price = 0;
    }

    Additem() {
        this.order.push(new Flag(0));
    }
}

export type TOrderTable = {
    // JSON から読み込むと Flag[] 型であることが保証されないため、自力でパースすること
    order: TFlag[];
    serial: number;
    casherId: number;
    receptionTime: number;
    paymentType: number;
}

export class Flag {
    flag: number = 0;

    constructor(flag: number) {
        this.flag = flag;
    }

    HasFlag(flag: number): boolean {
        return flag == (this.flag & flag);
    }

    AddFlag(flag: number) {
        this.flag |= flag;
    }

    RemoveFlag(flag: number) {
        this.flag &= ~flag;
    }
}

export type TFlag = {
    flag: number;
}