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

  // 注文確定（重複チェック付き）
  const handleConfirm = async () => {
    setSaving(true);
    try {
      // 1) ControllPanel 側の最新値を取得
      const s = Number(localStorage.getItem("kosen:serial"));
      const c = Number(localStorage.getItem("kosen:casherId"));
      const p = Number(localStorage.getItem("kosen:paymentType"));
      const MAX_SERIAL = 24; // ここは運用上の最大値に合わせて必要なら変更
      const serial = Number.isFinite(s)
        ? Math.min(MAX_SERIAL, Math.max(1, Math.floor(s)))
        : 1;
      const casherId = Number.isFinite(c)
        ? Math.min(45, Math.max(1, Math.floor(c)))
        : 1;
      const paymentType =
        p === 1 || p === 2 || p === 3 || p === 4 ? (p as 1 | 2 | 3 | 4) : 1;

      // 2) 現在の配列を取得
      const res = await fetch("/api/readOrder", { cache: "no-store" });
      const current: any[] = res.ok ? await res.json() : [];

      // 3) 直前の注文（オブジェクト側）の index を特定
      const tail = Array.isArray(current)
        ? current[current.length - 1]
        : undefined;
      const lastObjIndex = Array.isArray(tail)
        ? current.length - 2
        : current.length - 1;

      // 4) 既存で使用中の serial を収集（“配列要素”は履歴なので除外）
      const usedSerials: number[] = [];
      current.forEach((v, i) => {
        if (!Array.isArray(v) && typeof v?.serial === "number") {
          usedSerials.push(v.serial);
        }
      });

      // 5) 今回反映したい serial が「他の注文」で既に使われていないか判定
      const isSerialUsedByOthers = usedSerials.some((sr, i) => {
        // sr が一致し、かつ “自分（lastObjIndex）以外” が保持しているなら NG
        if (i === lastObjIndex) return false;
        return sr === serial;
      });

      if (isSerialUsedByOthers) {
        // 衝突。保存せずにエラーを通知
        window.alert(
          `整理券番号 ${serial} は既に使用中です。` +
            `「整理券番号」を別の値に変更してから確定してください。`
        );
        return; // ここで処理を中断（確定しない）
      }

      // 6) 新規注文に付与予定の serialNext も重複チェック（任意だが安全のため）
      const serialNext = (serial % MAX_SERIAL) + 1;
      const isSerialNextUsed = usedSerials.includes(serialNext);
      if (isSerialNextUsed) {
        window.alert(
          `次の整理券番号 ${serialNext} が既に使用中のため、注文を確定できません。` +
            `先に重複した整理券の呼び出し・処理を行うか、現在の整理券番号を調整してください。`
        );
        return; // 新規行の初期化も行わない
      }

      // 7) 直前の注文へ meta を反映
      if (
        Array.isArray(current) &&
        lastObjIndex >= 0 &&
        current[lastObjIndex] &&
        !Array.isArray(current[lastObjIndex])
      ) {
        const last = current[lastObjIndex] as any;
        last.serial = serial;
        last.casherId = casherId;
        last.paymentType = paymentType; // getter回避で小文字へ
      }

      // 8) 新規注文（serial+1、素うどん1つ）を末尾に追加
      const newOrder = {
        serial: serialNext,
        casherId,
        paymentType,
        receptionTime: Date.now(),
        order: [{ flag: 0 }],
      };
      const updated = Array.isArray(current)
        ? [...current, newOrder]
        : [newOrder];

      // 9) 書き込み → 再取得 → 通知
      await fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      await fetchNow(); // 一度情報を更新
      window.dispatchEvent(new CustomEvent("order:updated"));
      window.dispatchEvent(new CustomEvent("order:confirmed"));

      await fetch("/api/order/auto-sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", intervalMs: 1000 }),
      });
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
                : (lastTable?.PaymentType ??
                    (lastTable as any)?.paymentType) === 2
                ? "PayPay"
                : (lastTable?.PaymentType ??
                    (lastTable as any)?.paymentType) === 3
                ? "クレジット"
                : "交通系IC"}
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
