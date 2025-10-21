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
        this.flag = this.PrimeFind(index);
    }

    private PrimeFind(number: number): number {
        let i: number = 2;
        let primeArray: number[] = [i];
        while (primeArray.length <= number) {
            primeArray.filter(prime => i % prime == 0).length == 0 ? primeArray.push(i++) : i++;
        }
        return primeArray.pop() ?? 0;
    }
}