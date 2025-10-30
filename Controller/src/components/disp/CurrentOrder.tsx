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
    const raw = localStorage.getItem("kosen:draft");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        // 表記揺れを正規化（片方しか無くても両方揃える）
        if (
          typeof obj.paymentType === "number" &&
          typeof obj.PaymentType !== "number"
        ) {
          obj.PaymentType = obj.paymentType;
        }
        if (
          typeof obj.PaymentType === "number" &&
          typeof obj.paymentType !== "number"
        ) {
          obj.paymentType = obj.PaymentType;
        }
        setOrderNow([obj]); // ★[obj] にして UI/Manager と整合
        return;
      } catch (e) {
        console.error("draft parse error", e);
      }
    }

    // ドラフトが無ければ“現在の注文”は空にする
    setOrderNow([]);
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

      // ★サーバ書込はしない→下書き更新のみ
      localStorage.setItem("kosen:draft", JSON.stringify(lastTable));
      window.dispatchEvent(new CustomEvent("order:updated"));

      return [lastTable]; // 表示は1件
    });
  };

  // 注文確定（下書きからサーバへ保存。検証＋合計金額をpriceへ）
  const handleConfirm = async () => {
    setSaving(true);
    try {
      const MAX_SERIAL = 40;

      // 1) ControllPanel 側の最新値
      const s = Number(localStorage.getItem("kosen:serial"));
      const c = Number(localStorage.getItem("kosen:casherId"));
      const p = Number(localStorage.getItem("kosen:paymentType"));
      const serial = Number.isFinite(s)
        ? Math.min(MAX_SERIAL, Math.max(1, Math.floor(s)))
        : 1;
      const casherId = Number.isFinite(c)
        ? Math.min(45, Math.max(1, Math.floor(c)))
        : 1;
      const paymentType = p === 1 || p === 2 || p === 3 ? p : 0; // 0=未選択
      // 2) 下書き1件を取得
      const raw = localStorage.getItem("kosen:draft");
      if (!raw) {
        alert("下書きがありません。先に注文を作成してください。");
        return;
      }
      let last = JSON.parse(raw);

      // 3) メタ反映 & 検証
      last.serial = serial;
      last.casherId = casherId;
      last.paymentType = paymentType;

      if (!(last.paymentType >= 1 && last.paymentType <= 3)) {
        alert("支払方法が未選択です。選択してください。");
        return;
      }
      if (!Array.isArray(last.order) || last.order.length === 0) {
        alert("焼うどんが1つもありません。追加してください。");
        return;
      }

      // 4) 合計金額を算出して price に書き込む
      const basePrice = 300; // 既存UIのベース価格に合わせる
      const total = last.order.reduce(
        (prev: number, cur: any) =>
          prev +
          new OrderManager().menu
            .filter((m) => new Flag(cur.flag).HasFlag(m.Flag ?? 0))
            .reduce((sum, m) => sum + m.Price, 0) +
          basePrice,
        0
      );
      last.price = total;

      // 5) サーバの現状を読み取り → 下書き1件を末尾に push → 保存
      const res = await fetch("/api/readOrder", { cache: "no-store" });
      const current = res.ok ? await res.json() : [];
      const updated = Array.isArray(current) ? [...current, last] : [last];

      await fetch("/api/writeOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      // 6) 下書きをクリアし、確定イベント
      localStorage.removeItem("kosen:draft");
      localStorage.setItem("kosen:paymentType", "0"); // ← 念のためローカルも未選択へ
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

  const basePrice = 300;
  const moneyCalc = (menu: Menu[], flag: Flag) =>
    menu
      .filter((m) => flag.HasFlag(m.Flag ?? 0))
      .reduce((sum, m) => sum + m.Price, 0);

  const lastTable = orderManager.orderTable.at(-1);

  if (!orderNow) return <div className="p-3">読み込み中…</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-amber-500 p-3 flex justify-between items-center sticky top-0 z-10 font-semibold">
        <span className="text-2xl">現在の注文</span>
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

      <div className="w-full min-w-60 h-1/4 text-xl bottom-0 left-0 right-0 bg-amber-400 z-20">
        <div className="w-full border-t-2 font-bold p-3 space-y-2">
          <div className="flex justify-between text-2xl border-b border-dashed pb-1">
            <span>合計</span>
            <span className="text-3xl">
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
          {/* <div className="flex justify-between border-b border-dashed pb-1">
            <span>支払方法</span>
            <span className="text-xl">
              {(() => {
                const pt = (lastTable?.PaymentType ??
                  (lastTable as any)?.paymentType) as number | undefined;
                if (pt === 1) return "金券";
                if (pt === 2) return "PayPay";
                if (pt === 3) return "その他キャッシュレス";
                return "未選択";
              })()}
            </span>
          </div> */}
          {/* ↑なんかうまく表示できなくなっちゃったので消し炭にしてやりました */}
          <div className="w-full flex justify-end pt-6">
            <button
              className="bg-amber-600 text-white font-bold w-full text-2xl py-3 px-4 rounded
                         hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50"
              disabled={!lastTable || saving}
              onClick={handleConfirm}
            >
              注文確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
