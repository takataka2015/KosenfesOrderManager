import Employee from "./config/employeeList.json";
import Menu from "./config/menuConfig.json";

class OrderManager{
    order: OrderTable[];
    employee:{ employee: { id: number; name: string; }[]; }=Employee;
    menu:{ menu: { name: string; price: number; }[]; }=Menu;

    constructor(){
        this.order=[];
    }
    
    AddOrder(serial: number,casherId:number, paymentType: number, order: number[]){
        this.order.push(new OrderTable(serial,casherId,paymentType,order));
    }
}

class OrderTable {
    public serial: number;
    public casherId:number;
    public receptionTime: number;
    public paymentType: number;
    public order: number[];
    price: number;

    constructor(serial: number,casherId:number, paymentType: number, order: number[]) {
        this.serial = serial;
        this.casherId=casherId;
        this.order = order;
        this.paymentType = paymentType;
        this.receptionTime = Date.now();
        this.price = this.MoneyCalc();
    }

    MoneyCalc(): number {
        return 0;
    };
}



export default OrderManager;