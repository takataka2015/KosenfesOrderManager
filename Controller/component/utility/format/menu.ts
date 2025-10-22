export class Menu {
    private item: string;
    private price: number;
    private flag: number;

    get Item(): string {
        return this.item;
    }
    get Price(): number {
        return this.price;
    }
    get Flag(): number {
        return this.flag;
    }

    constructor(item: string, price: number, index: number) {
        this.item = item;
        this.price = price;
        this.flag = 2**(index+1);
    }
}