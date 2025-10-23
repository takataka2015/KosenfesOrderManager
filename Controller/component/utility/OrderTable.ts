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
    /**
     * 注文の合計金額
     */
    get Price(): number {
        return this.MoneyCalc();
    }

    constructor(serial: number, casherId: number, paymentType: number) {
        this.serial = serial;
        this.casherId = casherId;
        this.paymentType = paymentType;
        this.receptionTime = Date.now();
        this.order = [];
    }

    /**
     * 注文の金額を計算する
     * @returns 合計金額
     */
    private MoneyCalc(): number {
        return 0;
    };

    Additem() {
        this.order.push(new Flag());
    }
}

class Flag {
    flag: number = 0;

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