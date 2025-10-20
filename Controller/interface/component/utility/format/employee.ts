export class Employee {
    private id: number;
    private name: string

    get Id():number{
        return this.id;
    }
    get Name():string{
        return this.name;
    }

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}