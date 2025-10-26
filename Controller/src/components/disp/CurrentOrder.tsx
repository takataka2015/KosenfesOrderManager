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

  // ControllPanel 側からの更新通知で再取得
  useEffect(() => {
    const handler = () => {
      fetchNow().catch(console.error);
    };
    window.addEventListener("order:updated", handler);
    return () => window.removeEventListener("order:updated", handler);
  }, []);

  // 末尾注文の指定行を1件だけ削除 → 保存 → 通知
  const handleRemoveAt = (rowIndex: number) => {
    setOrderNow((prev) => {
      if (!prev?.length) return prev;
      const next = structuredClone(prev);
      const lastTable = next[next.length - 1];
      if (!Array.isArray(lastTable.order)) return prev;
      if (rowIndex < 0 || rowIndex >= lastTable.order.length) return prev;

      lastTable.order.splice(rowIndex, 1);

      setSaving(true);
      fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent("order:updated"));
        })
        .catch(console.error)
        .finally(() => setSaving(false));

      return next;
    });
  };

  // 注文確定（直前の注文に現在のserial、末尾に「serial+1の素うどん1つ」を追加して保存）
  const handleConfirm = async () => {
    setSaving(true);
    try {
      // 1) ControllPanel 側の最新値を取得
      const s = Number(localStorage.getItem("kosen:serial"));
      const c = Number(localStorage.getItem("kosen:casherId"));
      const p = Number(localStorage.getItem("kosen:paymentType"));
      const serial = Number.isFinite(s)
        ? Math.min(24, Math.max(1, Math.floor(s)))
        : 1;
      const casherId = Number.isFinite(c)
        ? Math.min(45, Math.max(1, Math.floor(c)))
        : 1;
      const paymentType = p === 1 || p === 2 ? p : 1;

      // 2) 現在の配列を取得
      const res = await fetch("/api/readOrder", { cache: "no-store" });
      const current = res.ok ? await res.json() : [];

      // 3) 直前の注文（オブジェクト側）へ現在の meta を反映
      if (Array.isArray(current) && current.length > 0) {
        const tail = current[current.length - 1];
        const lastObjIndex = Array.isArray(tail)
          ? current.length - 2
          : current.length - 1;
        if (
          lastObjIndex >= 0 &&
          current[lastObjIndex] &&
          !Array.isArray(current[lastObjIndex])
        ) {
          const last = current[lastObjIndex] as any;
          last.serial = serial; // ← 直前の注文は「現在の整理券番号」
          last.casherId = casherId;
          last.paymentType = paymentType; // getter回避で小文字へ
        }
      }

      // 4) 新規注文は「serial+1（24→1で循環）」を採番し、素うどん(flag:0)を1つ入れる
      const serialNext = (serial % 24) + 1;
      const newOrder = {
        serial: serialNext, // ← ここが重複防止の肝
        casherId,
        paymentType,
        receptionTime: Date.now(),
        order: [{ flag: 0 }], // 素うどん1つ
      };
      const updated = Array.isArray(current)
        ? [...current, newOrder]
        : [newOrder];

      // 5) 書き込み → 再取得 → 通知
      await fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      await fetchNow(); // 一度情報を更新
      window.dispatchEvent(new CustomEvent("order:updated"));
      window.dispatchEvent(new CustomEvent("order:confirmed")); // ControllPanel 側で表示の serial を+1
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const orderManager = new OrderManager();
  // 末尾が [] なら「現在の注文なし」として読む
  const raw = orderNow ?? [];
  const tail = Array.isArray(raw) ? raw[raw.length - 1] : undefined;
  const safeData = Array.isArray(tail) ? [] : raw;

  // これまで: orderManager.ReadOrder(orderNow ?? []);
  orderManager.ReadOrder(safeData);

  const basePrice = 200;
  const moneyCalc = (menu: Menu[], flag: Flag) =>
    menu
      .filter((m) => flag.HasFlag(m.Flag ?? 0))
      .reduce((sum, m) => sum + m.Price, 0);

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
              basePrice={basePrice}
            />
          ))}
          {!lastTable && (
            <div className="p-4 text-sm opacity-70">注文はまだありません</div>
          )}
        </div>
      </div>

      <div className="fixed w-1/4 min-w-60 bottom-0 left-0 right-0 bg-amber-400 shadow-lg z-20">
        <div className="w-full border-t-2 font-bold p-3 space-y-2">
          <div className="flex justify-between border-b border-dashed pb-1">
            <span>合計</span>
            <span className="text-xl">
              ￥
              {lastTable
                ? lastTable.order.reduce(
                    (prev, cur) =>
                      prev + moneyCalc(orderManager.menu, cur) + basePrice,
                    0
                  )
                : 0}
            </span>
          </div>
          <div className="flex justify-between border-b border-dashed pb-1">
            <span>支払方法</span>
            <span className="text-xl">
              {(lastTable?.PaymentType ?? (lastTable as any)?.paymentType) === 1
                ? "金券"
                : "こいPay"}
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
