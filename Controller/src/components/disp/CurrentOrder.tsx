"use client";
import { Menu } from "../../../component/utility/format/menu";
// import orderNowData from "../../../informationLog/OrderNow.json"; // ←使わない
import { OrderManager } from "../../../component/utility/OrderManager";
import { OrderTable, Flag } from "../../../component/utility/OrderTable";
import Order from "./Order";
import { useEffect, useState } from "react";

export default function CurrentOrder({ order }: { order?: any[] }) {
  const [orderNow, setOrderNow] = useState<any[] | null>(null);

  // 初期読み込み：props があればそれを優先、なければ JSON を fetch
  useEffect(() => {
    if (order && Array.isArray(order)) {
      setOrderNow(order);
      return;
    }
    (async () => {
      const res = await fetch("/api/readOrder", { cache: "no-store" });
      if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
      const json = await res.json();
      setOrderNow(json);
    })();
  }, [order]);

  // 表示用変換
  const orderManager = new OrderManager();
  orderManager.ReadOrder(orderNow ?? []); // null ガード

  // 指定 flag を末尾注文から削除し、保存 → 再描画
  const handleRemoveFlag = async (flagValue: number) => {
    setOrderNow((prev) => {
      if (!prev || prev.length === 0) return prev;
      // 深いコピー（構造化複製）
      const next = structuredClone(prev) as any[];
      const last = next[next.length - 1];
      if (!last || !Array.isArray(last.order)) return prev;

      // 指定 flag を持つ要素を除外
      last.order = last.order.filter((it: any) => it.flag !== flagValue);

      // 非同期保存（失敗しても UI は直ちに更新される）
      (async () => {
        fetch("/api/writeOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
      })();

      return next;
    });
  };

  // 焼うどんのベース価格
  const basePrice = 200;

  if (!orderNow) {
    return <div className="p-3">読み込み中…</div>;
  }

  const lastTable = orderManager.orderTable.at(-1);

  const moneyCalc = (menu: Menu[], flag: Flag) =>
    menu
      .filter((element: Menu) => flag.HasFlag(element.Flag ?? 0))
      .reduce((prev: number, cur: Menu) => prev + cur.Price, 0);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-amber-500 p-3 flex justify-center font-semibold sticky top-0 z-10">
        現在の注文
      </div>

      <div className="w-full flex-1 flex flex-col items-start overflow-y-auto pb-40">
        <div className="w-full flex flex-col items-start pb-3" id="order-list">
          {lastTable?.order.map((flag: Flag, index: number) => (
            <Order
              key={index}
              index={index}
              flag={flag}
              menu={orderManager.menu}
              onRemoveFlag={handleRemoveFlag} // ← ここで削除ハンドラを渡す
              basePrice={basePrice}
            />
          ))}
        </div>
      </div>

      <div className="fixed flex flex-col items-start h-30 bottom-0 left-0 w-25/100 min-w-50 bg-amber-400 shadow-lg z-20">
        <div className="w-full border-t-2 font-bold p-2">
          <div className="flex justify-between border-b-1 border-dashed">
            合計
            <span className="text-xl">
              ￥
              {lastTable?.order.reduce(
                (prev, cur) =>
                  prev + moneyCalc(orderManager.menu, cur) + basePrice,
                0
              )}
            </span>
          </div>
          <div className="flex justify-between border-b-1 border-dashed">
            支払方法
            <span className="text-xl">
              {lastTable?.PaymentType === 1 ? "金券" : "こいPay"}
            </span>
          </div>
          <div className="w-full flex justify-end py-2">
            <button
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded
              hover:bg-amber-700 active:bg-amber-800 
              transform transition-all duration-100 
              hover:scale-105 active:scale-95 
              hover:shadow-md active:shadow-inner"
            >
              注文確定
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
