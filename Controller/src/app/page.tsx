import Image from "next/image";
import CurrentOrder from "../components/disp/CurrentOrder";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans flex flex-row min-h-screen ">
      {/* 現在注文内容 */}
      <div className="bg-amber-300 flex flex-col justify-between min-h-screen w-25/100 min-w-50">
        <CurrentOrder />
      </div>

      {/* 入力部 */}
      <div className="bg-blue-300 grid min-h-screen w-75/100">bb</div>

      <Link href={"/employeeManagement"}>
        タイムカード
      </Link>
    </div>
  );
}
