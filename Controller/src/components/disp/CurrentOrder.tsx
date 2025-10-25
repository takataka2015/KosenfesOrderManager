"use client";
import { Menu } from "../../../component/utility/format/menu";
import { OrderManager } from "../../../component/utility/OrderManager";
import { Flag } from "../../../component/utility/OrderTable";
import Order from "./Order";
import { useEffect, useState } from "react";

type OrderItem = { flag: number };
type OrderTable = {
  serial: number;
  casherId: number;
  paymentType: number;
  receptionTime: number;
  order: OrderItem[];
};

export default function CurrentOrder() {
  const [orderNow, setOrderNow] = useState<OrderTable[] | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const fetchNow = async () => {
    const res = await fetch("/api/readOrder", { cache: "no-store" });
    if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
    setOrderNow(await res.json());
  };

  useEffect(() => {
    fetchNow().catch(console.error);
  }, []);

  +(
    // ControllPanel からの更新通知で再取得
    useEffect(() => {
      const handler = () => {
        fetchNow().catch(console.error);
      };
      window.addEventListener("order:updated", handler);
      return () => window.removeEventListener("order:updated", handler);
    }, [])
  );

  // 末尾注文から指定flagを削除 → 保存 → 再描画
  const handleRemoveAt = (rowIndex: number) => {
    setOrderNow((prev) => {
      if (!prev?.length) return prev;
      const next = structuredClone(prev);
      const lastTable = next[next.length - 1];
      if (!Array.isArray(lastTable.order)) return prev;
      if (rowIndex < 0 || rowIndex >= lastTable.order.length) return prev;
      // 行インデックスで1件だけ削除
      lastTable.order.splice(rowIndex, 1);

      fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent("order:updated"));
        })
        .catch(console.error);
      return next;
    });
  };

  // 注文確定 → OrderNow.jsonを[]にリセット → 再取得
  const handleConfirm = async () => {
    setSaving(true);
    const res = await fetch("/api/confirmOrder", { method: "POST" });
    setSaving(false);
    if (!res.ok) {
      console.error(await res.text());
      return;
    }
    await fetchNow();
    window.dispatchEvent(new CustomEvent("order:updated"));
  };

  const orderManager = new OrderManager();
  orderManager.ReadOrder(orderNow ?? []);

  const basePrice = 200;
  const moneyCalc = (menu: Menu[], flag: Flag) =>
    menu
      .filter((m: Menu) => flag.HasFlag(m.Flag ?? 0))
      .reduce((sum: number, m: Menu) => sum + m.Price, 0);

  const lastTable = orderManager.orderTable.at(-1);

  if (!orderNow) return <div className="p-3">読み込み中…</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-amber-500 p-3 flex justify-between items-center sticky top-0 z-10 font-semibold">
        <span>現在の注文</span>
        {saving && <span className="text-sm opacity-70">保存中…</span>}
      </div>

      <div className="w-full flex-1 flex flex-col items-start overflow-y-auto pb-40">
        <div className="w-full flex flex-col items-start pb-3" id="order-list">
          {lastTable?.order.map((flag, index) => (
            <Order
              key={index}
              index={index}
              flag={flag}
              menu={orderManager.menu}
              onRemove={handleRemoveAt}
            />
          ))}
          {!lastTable && (
            <div className="p-4 text-sm opacity-70">注文はまだありません</div>
          )}
        </div>
      </div>

      <div className="fixed w-1/4 bottom-0 left-0 right-0 bg-amber-400 shadow-lg z-20">
        <div className="w-full border-t-2 font-bold p-3 space-y-2">
          <div className="flex justify-between border-b border-dashed pb-1">
            <span>合計</span>
            <span className="text-xl">
              ￥
              {lastTable?.order.reduce(
                (prev, cur) =>
                  prev + moneyCalc(orderManager.menu, cur) + basePrice,
                0
              ) ?? 0}
            </span>
          </div>
          <div className="flex justify-between border-b border-dashed pb-1">
            <span>支払方法</span>
            <span className="text-xl">
              {lastTable?.PaymentType === 1 ? "金券" : "こいPay"}
            </span>
          </div>
          <div className="w-full flex justify-end pt-2">
            <button
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded
                         hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50"
              disabled={!lastTable || saving}
              onClick={handleConfirm}
            >
              注文確定
            </button>
          </div>
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}
