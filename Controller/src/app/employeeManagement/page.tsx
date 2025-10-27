import Image from "next/image";
import NowEmployeeList from "./employeeList";
import Link from "next/link";
import TimeCardForm from "./timeCardForm";

    interface employeeListItem{
        id:number;
        name:string;
    }

    interface employeeListData{
        data:employeeListItem[];
    }

export default async function EmployeeManagement()
{
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
        <TimeCardForm />
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
