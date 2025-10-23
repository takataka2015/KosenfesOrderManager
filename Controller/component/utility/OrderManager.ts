import fs from 'fs';
import { FilePath } from './format/filePath';
import { OrderTable } from './OrderTable';
import MenuJson from "../../informationLog/config/menuConfig.json";
import { Menu } from "./format/menu";
import EmployeeJson from "../../informationLog/config/employeeList.json";
import { Employee } from "./format/employee";

/**
 * 注文を管理するためのクラス
 */
export class OrderManager {
    /**
     * ファイルパス
     */
    private path: FilePath = new FilePath();
    /**
     * 現在ある注文
     */
    orderTable: OrderTable[];
    /**
     * jsonから読み込んだメニューの情報
     */
    menu: Menu[];
    /**
     * jsonから読み込んだ従業員の情報
     */
    employee: Employee[];


    constructor() {
        this.orderTable = [];
        this.menu = [];
        this.employee = [];
        MenuJson.data.forEach((element, index) => this.menu.push(new Menu(element.item, element.price, index)));
        EmployeeJson.data.forEach(element => this.employee.push(new Employee(element.id, element.name)));
    }

    FindMenu(): Menu[] {
        return this.menu;
    }

    AddOrder(serial: number, casherId: number, paymentType: number){
        this.orderTable.push(new OrderTable(serial,casherId,paymentType));
    }

    /**
     * 現在の注文を読み込む
     */
    ReadOrder() {
        this.orderTable = JSON.parse(fs.readFileSync(this.path.order.Now, 'utf-8'));
    }

    /**
     * 現在の注文内容を書き込む
     */
    WriteOrder() {
        fs.writeFileSync(this.path.order.Now, JSON.stringify(this.orderTable, undefined, ' '), 'utf-8');
    }

    /**
     * 受付番号を指定してその注文を削除する
     * @param serial 受付番号
     * @returns 実行結果
     * @description 0:正常終了,1:その受付番号が見つからない
     */
    ClearOrder(serial: number): number {
        let index: number = this.orderTable.findIndex(element => element.serial == serial);
        if (index != -1) {
            let removeOrder: OrderTable = this.orderTable.splice(index, 1)[0];
            fs.writeFileSync(this.path.order.Now, JSON.stringify(this.orderTable, undefined, ' '), 'utf-8');
            fs.appendFileSync(this.path.order.History, JSON.stringify(removeOrder, undefined, ' ') + ",", 'utf-8');
            return 0;
        }
        else {
            return 1;
        }
    }

    /**
     * unity側で指定された受付番号を確認し自動的に削除する
     */
    ClearRequestCheck() {
        let requestJson: { serials: number[] } = JSON.parse(fs.readFileSync(this.path.order.Request, 'utf-8'));
        requestJson.serials = requestJson.serials.filter(element => this.ClearOrder(element) == 1);
        fs.writeFileSync(this.path.order.Request, JSON.stringify(requestJson, undefined, ' '), 'utf-8')
    }
}