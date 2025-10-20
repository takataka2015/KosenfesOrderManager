import {OrderManager} from "./OrderManager";

const manager=new OrderManager();
manager.AddOrder(1,3,2,[2,3]);
manager.AddOrder(2,4,3,[4,5,1]);
console.log(manager.order);
manager.RemoveOrder(0);
console.log(manager.order);
