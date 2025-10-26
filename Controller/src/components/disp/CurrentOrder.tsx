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

  // 注文確定（末尾に [] を追加して保存）
  const handleConfirm = async () => {
    setSaving(true);
    try {
      // ➊ ControllPanel 側で保持している最新値を localStorage から取得
      const s = Number(localStorage.getItem("kosen:serial"));
      const c = Number(localStorage.getItem("kosen:casherId"));
      const p = Number(localStorage.getItem("kosen:paymentType"));
      const serial = Number.isFinite(s)
        ? Math.min(24, Math.max(1, Math.floor(s)))
        : undefined;
      const casherId = Number.isFinite(c)
        ? Math.min(45, Math.max(1, Math.floor(c)))
        : undefined;
      const paymentType = p === 1 || p === 2 ? p : undefined;

      // ➋ 現在の注文データを取得
      const res = await fetch("/api/readOrder", { cache: "no-store" });
      const current = res.ok ? await res.json() : [];

      if (Array.isArray(current) && current.length > 0) {
        // 末尾が [] の場合は「ひとつ前」のオブジェクトが現在の注文
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
          if (serial !== undefined) last.serial = serial;
          if (casherId !== undefined) last.casherId = casherId;
          if (paymentType !== undefined) last.paymentType = paymentType; // getter回避で小文字側へ
        }
      }

      // ➌ 末尾に空配列 [] を追加
      const updated = Array.isArray(current) ? [...current, []] : [[], []];

      // ➍ 書き込み
      await fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      // ➎ 再取得して反映 + イベント通知（表示更新／整理券+1）
      await fetchNow();
      window.dispatchEvent(new CustomEvent("order:updated"));
      window.dispatchEvent(new CustomEvent("order:confirmed"));
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
