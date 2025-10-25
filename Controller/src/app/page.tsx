"use client";

import CurrentOrder from "../components/disp/CurrentOrder";
import ControllPanel from "../components/disp/ControllPanel";
import { useEffect, useState } from "react";

export default function Home() {
  let [order, setOrder] = useState<any[] | undefined>(undefined);

  // 初めてページが読み込まれたとき
  useEffect(() => {
    // 現在のオーダー内容を取得する
    fetch("/api/readOrder")
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => setOrder(undefined));
  }, []);

  return (
    <div className="font-sans flex flex-row min-h-screen ">
      {/* 現在注文内容 */}
      <div className="bg-amber-300 flex flex-col justify-between min-h-screen w-25/100 min-w-50">
        <CurrentOrder order={order} />
      </div>

      {/* 入力部 */}
      <div className="bg-blue-300 grid min-h-screen w-75/100">
        <ControllPanel />
      </div>
    </div>
  );
}
