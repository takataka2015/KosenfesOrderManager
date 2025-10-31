'use server'; // ★ ファイルの先頭に記述

import EmployeeJson from "../../../informationLog/config/employeeList.json";
import AttendanceJson from "../../../informationLog/Attendance.json"
import { TimeCard } from "../../../component/utility/TimeCard";
import { revalidatePath } from "next/cache";

// 1. 型定義をこちらに移動
export type FormState = {
    message: string;
    success?: boolean; 
};

// 2. submit 関数をこちらに移動
export async function submitAction(prevState: FormState, formData: FormData): Promise<FormState> {
    
    // このファイルは 'use server' なので、
    // 以下の処理はすべてサーバー上で実行されます。
    
    const timeCard = new TimeCard();
    const idString = formData.get('employeeId') as string;
    const action = formData.get('action') as string;
    const foundUser = EmployeeJson.data.find((item) => item.id.toString() === idString);
    let workTime = 0;

    if(foundUser){
        // 1. AttendanceJson から、見つかったユーザーと同じIDの記録を探す
    const attendanceRecord = AttendanceJson.find(
    (record) => record.id === foundUser.id
    );

    // 2. 勤怠記録が見つかった場合のみ計算
    if (attendanceRecord) {
        const logs = attendanceRecord.clockLog; // [176..., 176..., 176...]

        // 3. 2つずつペアにしてループ処理 (i = 0, 2, 4, ...)
        for (let i = 0; i < logs.length; i += 2) {
        const clockInTime = logs[i];     // 出勤時刻
        const clockOutTime = logs[i + 1]; // 退勤時刻

        // 4. 退勤時刻が存在する場合（ペアが揃っている場合）のみ計算
        // (ログが奇数個で最後の打刻が出勤のみの場合、計算に含めない)
        if (clockOutTime !== undefined) {
            // 差（ミリ秒）を workTime に加算
            workTime += (clockOutTime - clockInTime);
        }
    }
    }
}

    console.log("Server Action ID:", idString);
    console.log("Server Action Action:", action);

    if (!foundUser) {
        return { message: '指定した出席番号が見つかりません' };
    }

    if (action === 'check') {
        console.log("user:", foundUser.name);
        const workMinutes =workTime/(1000*60);
        const workMinutesFixed = workMinutes.toFixed(1);
        return { message: `出席番号：${foundUser.id}  名前：${foundUser.name}   労働時間${workMinutesFixed}` };
    }

    if (action === 'clock-in') {
        console.log("user:", foundUser.name);
        // ★ TimeCard がサーバー環境で動作しない場合、ここでエラーになります
        const clockInResult = timeCard.ClockIn(foundUser.id); 

        if (clockInResult === 0) {
            revalidatePath('/employeeManagement');
            return { message: `出席番号：${foundUser.id}  名前：${foundUser.name}   出勤`, success: true };
        }
        else if (clockInResult === 1) {
            return { message: '指定した出席番号が見つかりません' };
        }
        else {
            return { message: `出席番号：${foundUser.id}  名前：${foundUser.name}  すでに出勤しています` };
        }
    }

    if (action === 'clock-out') {
        console.log("user:", foundUser.name);
        const clockOutResult = timeCard.ClockOut(foundUser.id);
        if (clockOutResult === 0) {
            revalidatePath('/employeeManagement');
            return { message: `出席番号：${foundUser.id}  名前：${foundUser.name}   退勤`, success: true };
        }
        else if (clockOutResult === 1) {
            return { message: '指定した出席番号が見つかりません' };
        }
        else {
            return { message: `出席番号：${foundUser.id}   名前：${foundUser.name} すでに退勤しています` };
        }
    }

    return { message: '不明な操作です' };
}