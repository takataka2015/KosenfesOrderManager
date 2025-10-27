'use server'; // ★ ファイルの先頭に記述

import EmployeeJson from "../../../informationLog/config/employeeList.json";
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

    console.log("Server Action ID:", idString);
    console.log("Server Action Action:", action);

    if (!foundUser) {
        return { message: '指定した出席番号が見つかりません' };
    }

    if (action === 'check') {
        console.log("user:", foundUser.name);
        return { message: `出席番号：${foundUser.id}  名前：${foundUser.name}` };
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