import Image from "next/image";
import Timecard from "../../component/utility/TimeCard";

export default function Home() {
  return (
    <>
    <h1>タイムカード</h1>
    <p>出退勤を行う際は必ず操作を行ってください</p>
    <button>出勤</button>
    <button>退勤</button>
    <h2>現在出勤者リスト</h2>
    <table>
      <li>
        高専太郎
      </li>
    </table>
    </>
  );
}
