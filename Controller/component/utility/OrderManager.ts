import { FilePath } from './format/filePath';
import { OrderTable, TOrderTable, Flag, TFlag } from './OrderTable';
import MenuJson from "../../informationLog/config/menuConfig.json";
import { Menu } from "./format/menu";
import EmployeeJson from "../../informationLog/config/employeeList.json";
import { Employee } from "./format/employee";
import 'reflect-metadata';
//import { plainToInstance } from 'class-transformer';

/**
 * 注文を管理するためのクラス
 */
export class OrderManager {

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
    ReadOrder(json: any) {
        if (json)
        {
            let _orderTable = json as TOrderTable[];
            this.orderTable = _orderTable.map((_order: TOrderTable) => new OrderTable(_order.serial, _order.casherId, _order.paymentType));
            
            for (let i = 0; i < this.orderTable.length; i++) {
                this.orderTable[i].order = _orderTable[i].order.map((_o: TFlag) => new Flag(_o.flag));
            }
        }
        
    }

    /**
     * 現在の注文内容を書き込む \
     * fetch() にラップして使って下さい！！！
     * @example
     * fetch("/api/writeOrder/", { method: "POST", headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ n: parseInt(n) }
             })
     */
    WriteOrder() : string {
        return JSON.stringify(this.orderTable, undefined, ' ');
    }

/**
 * 受付番号を指定してその注文を削除（API経由）
 * @returns 0=削除成功, 1=見つからず
 */
async ClearOrder(serial: number): Promise<0 | 1> {
  const res = await fetch("/api/order/delete-by-serial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serial }),
    cache: "no-store",
  });
  if (!res.ok) return 1;
  const j = await res.json();
  return j.ok && j.found ? 0 : 1;
}

/**
 * Unity側で指定された受付番号を確認し自動的に削除（1回実行、API経由）
 */
async ClearRequestCheck(): Promise<void> {
  await fetch("/api/order/clear-requests", { method: "POST", cache: "no-store" });
}

}