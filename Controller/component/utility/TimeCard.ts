import fs from 'fs';
import { FilePath } from "./format/filePath";
import { Employee } from "./format/employee";
import EmployeeJson from "../../informationLog/config/employeeList.json";

/**
 * タイムカード的な機能を集めたクラス
 */
export class TimeCard {
    /**
     * ファイルパス
     */
    private path: FilePath = new FilePath();
    /**
     * jsonから読み込んだ従業員の情報
     */
    employee: Employee[];
    /**
     * jsonに書き込むための従業員の情報
     */
    attend: AttendSheet[];

    constructor() {
        this.employee = [];
        this.attend = [];
        EmployeeJson.data.forEach(element => {
            this.employee.push(new Employee(element.id, element.name));
            this.attend.push(new AttendSheet(element.id));
        });
    }

    /**
     * 指定した固有番号を持つ従業員の出勤処理を行う
     * @param id 固有番号
     * @returns 実行結果
     * @description 0:正常終了,1:指定された固有番号が見つからない,2:既に出勤済み
     */
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

    /**
     * 指定した固有番号を持つ従業員の退勤処理を行う
     * @param id 固有番号
     * @returns 実行結果
     * @description 0:正常終了,1:指定された固有番号が見つからない,2:既に退勤済み
     */
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

/**
 * 一人の勤怠管理をするためのクラス
 */
class AttendSheet {
    /**
     * 従業員の固有番号
     */
    private id: number;
    /**
     * 出勤しているかどうか
     */
    isExist: boolean;
    /**
     * 出退勤の時間
     */
    clockLog: number[];

    /**
     * 合計出勤時間
     */
    get workingTime(): number {
        return Math.floor(this.MakePairArray(this.clockLog).reduce((previous, current) => previous + (current[1] ?? Date.now()) - current[0], 0) / 1000);
    };

    constructor(id: number) {
        this.id = id;
        this.isExist = false;
        this.clockLog = [];
    }

    /**
     * ある1次元配列を隣の要素同士のペアの2次元配列に変換する
     * @param array 配列
     * @returns 変換後の2次元配列
     */
    private MakePairArray(array: number[]): number[][] {
        return new Array(Math.ceil(array.length / 2)).fill(0).map((_, i) => array.slice(i * 2, i * 2 + 2));
    }
}