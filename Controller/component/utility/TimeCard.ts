import fs from 'fs';
import { FilePath } from "./format/filePath";
import { Employee } from "./format/employee";
import EmployeeJson from "../../informationLog/config/employeeList.json";

export class TimeCard {
    path: FilePath = new FilePath();
    employee: Employee[];
    attend: AttendSheet[];

    constructor() {
        this.employee = [];
        this.attend = [];
        EmployeeJson.data.forEach(element => {
            this.employee.push(new Employee(element.id, element.name));
            this.attend.push(new AttendSheet(element.id));
        });
    }

    ClockIn(id: number): number {
        let index: number = this.employee.findIndex(element => id == element.Id);
        if (index != -1 && !this.attend[index].isExist) {
            this.attend[index].isExist = true;
            this.attend[index].clockLog.push(Date.now());
            fs.writeFileSync(this.path.Attendance, JSON.stringify(this.attend, undefined, ' '), 'utf-8');
            return 0;
        }
        else if (index == -1) {
            return 1;
        }
        else {
            return 2;
        }
    }

    ClockOut(id: number): number {
        let index: number = this.employee.findIndex(element => id == element.Id);
        if (index != -1 && this.attend[index].isExist) {
            this.attend[index].isExist = false;
            this.attend[index].clockLog.push(Date.now());
            fs.writeFileSync(this.path.Attendance, JSON.stringify(this.attend, undefined, ' '), 'utf-8');
            return 0;
        }
        else if (index == -1) {
            return 1;
        }
        else {
            return 2;
        }
    }
}

class AttendSheet {
    private id: number;
    isExist: boolean;
    clockLog: number[];

    get workingTime(): number {
        return Math.floor(this.MakePairArray(this.clockLog).reduce((previous, current) => previous + (current[1] ?? Date.now()) - current[0], 0) / 1000);
    };

    constructor(id: number) {
        this.id = id;
        this.isExist = false;
        this.clockLog = [];
    }

    private MakePairArray(array: number[]): number[][] {
        return new Array(Math.ceil(array.length / 2)).fill(0).map((_, i) => array.slice(i * 2, i * 2 + 2));
    }
}