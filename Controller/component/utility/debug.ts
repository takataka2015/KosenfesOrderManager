import { TimeCard } from "./TimeCard";
import { OrderManager } from "./OrderManager";

const manager = new OrderManager();
const timeCard = new TimeCard();
timeCard.ClockIn(71000);
setTimeout(() => {
    timeCard.ClockOut(71000);
    console.log(timeCard.attend[0].workingTime);
}, 5000);
setTimeout(() => {
    timeCard.ClockIn(71000);
}, 10000);
setTimeout(() => {
    console.log(timeCard.attend[0].workingTime);
}, 15000);
//console.log(timeCard.attend[0].workingTime);