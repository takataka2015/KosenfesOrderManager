import { TimeCard } from "./TimeCard";
import { OrderManager } from "./OrderManager";

const manager = new OrderManager();
const timeCard = new TimeCard();
timeCard.ClockIn(71000);
setTimeout(() => {
    timeCard.ClockOut(71000);
    console.log(timeCard.attend[0].workingTime);
}, 10000);
manager.AddOrder(1, 3, 2, [2, 3]);
manager.AddOrder(2, 4, 3, [4, 5, 1]);
manager.AddOrder(3, 4, 3, [4, 1]);
manager.RemoveOrder(0);
console.log(manager.order);