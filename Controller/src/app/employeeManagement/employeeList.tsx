//現在出勤者のデータを表にするためのコンポーネント
import employeeListJson from "../../../informationLog/config/employeeList.json";
import employeeAttendance from "../../../informationLog/Attendance.json";
// submitAction はこのコンポーネントでは使用しないため削除しました

interface EmployeeData {
  id: number;
  name: string;
}

// 勤怠データ（Attendance.json）の型定義
interface AttendanceData {
  id: number;
  isExist: boolean; // 修正: 出勤状態を判断するために追加
  clockLog: number[];
}

// インポートしたJSONを変数に格納 (型を適用)
const allEmployees: EmployeeData[] = employeeListJson.data;
const attendanceRecords: AttendanceData[] = employeeAttendance;

export default function EmployeeList() {
  // --- 出勤中の従業員データを抽出 ---

  // 1. 出勤中の従業員IDをリストアップ
  const clockedInIds = attendanceRecords
    .filter(record => record.isExist === true) // isExistがtrueの記録のみ
    .map(record => record.id); // IDの配列を作成

  // 2. 出勤中のIDに該当する従業員の情報を取得
  const currentlyClockedIn = allEmployees.filter(employee =>
    clockedInIds.includes(employee.id)
  );

  // --- レンダリング ---
  return (
    <>
      {/* 修正: 表全体を <table> タグで囲みます */}
      <div className="mt-5">
        <table>
          <thead className="text-4xl mt-10">
            <tr>
              <th className="px-4 py-2">出席番号</th>
              <th className="px-4 py-2">名前</th>
            </tr>
          </thead>
          <tbody className="text-2xl">
            {/* 3. 取得した出勤者リストを .map() で <tr> (行) に変換 */}
            {currentlyClockedIn.map((employee) => (
              // mapでリストをレンダリングする際は、各要素にユニークな "key" が必要
              <tr key={employee.id}>
                {/* 修正: <li> ではなく <td> (テーブルセル) を使います */}
                <td className="px-4 py-2 text-center">{employee.id}</td>
                <td className="px-4 py-2">{employee.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}