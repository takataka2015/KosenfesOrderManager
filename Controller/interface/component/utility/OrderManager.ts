import fs from 'fs';
import { FilePath } from './format/filePath';
import MenuJson from "../../../informationLog/config/menuConfig.json";
import { Menu } from "./format/menu";
import EmployeeJson from "../../../informationLog/config/employeeList.json";
import { Employee } from "./format/employee";

export class OrderManager {
    order: OrderTable[];
    path: FilePath = new FilePath();
    menu: Menu[];
    employee: Employee[];


    constructor() {
        this.order = [];
        this.menu = [];
        this.employee = [];
        MenuJson.data.forEach((element, index) => this.menu.push(new Menu(element.item, element.price, index)));
        EmployeeJson.data.forEach(element => this.employee.push(new Employee(element.id, element.name)));
    }

    AddOrder(serial: number, casherId: number, paymentType: number, order: number[]) {
        this.order.push(new OrderTable(serial, casherId, paymentType, order));
        fs.writeFileSync(this.path.order.Now, JSON.stringify(this.order, undefined, ' '), 'utf-8');
    }

    RemoveOrder(index: number) {
        let removeOrder: OrderTable = this.order.splice(index, 1)[0];
        fs.writeFileSync(this.path.order.Now, JSON.stringify(this.order, undefined, ' '), 'utf-8');
        fs.appendFileSync(this.path.order.History, JSON.stringify(removeOrder, undefined, ' '), 'utf-8');
    }
}

class OrderTable {
    serial: number;
    casherId: number;
    receptionTime: number;
    paymentType: number;
    order: number[];
    price: number;

    constructor(serial: number, casherId: number, paymentType: number, order: number[]) {
        this.serial = serial;
        this.casherId = casherId;
        this.order = order;
        this.paymentType = paymentType;
        this.receptionTime = Date.now();
        this.price = this.MoneyCalc();
    }

    MoneyCalc(): number {
        return 0;
    };
}