import Image from "next/image";
import NowEmployeeList from "./employeeList";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import EmployeeJson from "../../../informationLog/config/employeeList.json"
import { TimeCard } from "../../../component/utility/TimeCard";

    interface employeeListItem{
        id:number;
        name:string;
    }

    interface employeeListData{
        data:employeeListItem[];
    }

export default async function EmployeeManagement()
{
    const timeCard = new TimeCard();

    async function submit(formData:FormData){
        'use server'
        const idString =formData.get('employeeId') as string;
        const action =formData.get('action') as string;

        console.log(idString);
        }
        
    return(
    <>
    <div className="ml-2">
        <h1 
            className="font-bold text-5xl">
            タイムカード</h1>
        <div 
            className="mt-5 text-xl">
                出退勤を行う際は必ず操作を行ってください
        </div>
        <div className="mt-1">
        <form action={submit}>
            <div className="mt-1">
                <input 
                name="employeeId" // (Server Action側と名前を統一: "number" -> "employeeId")
                className="border border-gray-700"
                type="number"
                placeholder="出席番号を入力"
                required // 入力必須
            />
            
            <button 
                type="submit" name="action" value="check"
                className="bg-gray-600 text-white font-bold py-2 px4 rounded ml-10
                hover:bg-gray-700 active:bg-gray-800
                hover:scale-105 active:scale-95
                hover:shadow-md active:shadow-inner">出席番号確認</button>
            
            </div>

          {/* ▼ 6. 出退勤ボタンを同じフォーム内に配置 */}
            <div className="mt-5">
                <button
                type="submit"
                name="action"     // どのボタンが押されたか
                value="clock-in" // 押された時の値
                className="bg-lime-600 text-white font-bold py-2 px-4 rounded mr-10
                hover:bg-lime-700 active:bg-lime-800
                hover:scale-105 active:scale-95
                hover:shadow-md active:shadow-inner">出勤</button>
    
                <button
                type="submit"
                name="action"      // どのボタンが押されたか
                value="clock-out" // 押された時の値
                className="bg-amber-600 text-white font-bold py-2 px-4 rounded
                hover:bg-amber-700 active:bg-amber-800
                hover:scale-105 active:scale-95
                hover:shadow-md active:shadow-inner">退勤</button>
            </div>
        </form>
        </div>
        <div 
            className="font-bold text-3xl mt-10">
            現在出勤者リスト</div>
        <div>
        <NowEmployeeList />
        <Link href={"/"}
            className="font-bold text-2xl text-indigo-500
            hover:text-indigo-800 active:text-fuchsia-200">
                ホームへ</Link>
        </div>
    </div>
    </>
    );
}
