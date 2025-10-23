/**
 * 従業員の情報
 */
export class Employee {
    private id: number;
    private name: string

    /**
     * 従業員の固有番号
     */
    get Id(): number {
        return this.id;
    }
    /**
     * 従業員の名前
     */
    get Name(): string {
        return this.name;
    }

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}