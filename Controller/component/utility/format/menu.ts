/**
 * メニューの情報
 */
export class Menu {
    private item: string;
    private price: number;
    private flag: number;

    /**
     * 商品名
     */
    get Item(): string {
        return this.item;
    }
    /**
     * 商品価格
     */
    get Price(): number {
        return this.price;
    }
    /**
     * 情報を参照するためのフラグ
     */
    get Flag(): number {
        return this.flag;
    }

    constructor(item: string, price: number, index: number) {
        this.item = item;
        this.price = price;
        this.flag = 2 ** index;
    }
}