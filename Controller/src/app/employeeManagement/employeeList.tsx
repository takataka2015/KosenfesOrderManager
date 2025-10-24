//現在出勤者用のデータを表にするためのコンポーネント
import { json } from "stream/consumers";

export default function EmployeeList()
{
    return(
        <>
        <div className="mt-5">
            <table>
                <thead className="text-4xl mt-10">
                    <tr>
                        <th >出席番号</th>
                        <th>名前</th>
                    </tr>
                </thead>
                <tbody className="text-2xl">
                    <tr>
                        <td></td>
                        <td>赤木</td>
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    );
}