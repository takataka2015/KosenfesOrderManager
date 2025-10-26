"use client";
import menuConfig from "../../../informationLog/config/menuConfig.json";
import { useEffect, useRef, useState } from "react";
import { OrderManager } from "../../../component/utility/OrderManager";

// Flagを確実にビット値にする（未定義・インデックス・文字列にも耐性）
const toBit = (raw: unknown, fallbackIndex: number) => {
  const n = Number(raw);
  if (Number.isFinite(n)) {
    // すでに 1,2,4,8,... などのパワーオブツーならそのまま
    if (n > 0 && (n & (n - 1)) === 0) return n;
    // 0,1,2,... のインデックス想定
    if (n >= 0) return 1 << n;
  }
  // Flagが未定義など → ボタンのindexからビット化
  return 1 << fallbackIndex;
};

// OrderTableに支払方法をセットするためのメソッド検出
const setPaymentTypeOn = (orderTable: any, value: number): boolean => {
  const candidates = [
    "SetPaymentType",
    "setPaymentType",
    "ChangePaymentType",
    "SetPayType",
    "SetPayment",
  ];
  for (const name of candidates) {
    if (typeof orderTable?.[name] === "function") {
      orderTable[name](value);
      return true;
    }
  }
  // プロパティ直書き（setterが用意されている場合のみ成功）
  if ("paymentType" in orderTable) {
    try {
      orderTable.paymentType = value;
      return true;
    } catch {}
  }
  return false;
};

type OrderItem = { flag: number };
type OrderTable = {
  serial: number;
  casherId: number;
  paymentType?: number; // 実装により大文字/小文字揺れあり
  PaymentType?: number;
  receptionTime: number;
  order: OrderItem[];
};

export default function ControllPanel() {
  const data = menuConfig.data as Array<{
    item: string;
    price: number;
    Flag?: number;
  }>;
  const managerRef = useRef(new OrderManager());
  const manager = managerRef.current;

  const [saving, setSaving] = useState(false);
  const [paymentType, setPaymentType] = useState<number>(1);

  // ---- サーバ <-> Manager 同期 ----
  const loadLatestIntoManager = async () => {
    const res = await fetch("/api/readOrder", { cache: "no-store" });
    if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
    const json = (await res.json()) as OrderTable[];
    manager.ReadOrder(json);
    const last: any = manager.orderTable.at(-1);
    if (last) {
      const pt = last.PaymentType ?? last.paymentType ?? paymentType;
      setPaymentType(pt);
    }
  };

  const writeManagerToServer = async () => {
    setSaving(true);
    const body = manager.WriteOrder(); // JSON文字列
    const res = await fetch("/api/writeOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    setSaving(false);
    if (!res.ok) {
      console.error("writeOrder NG:", await res.text());
      return false;
    }
    // 表示側へ更新通知 & 最終同期
    window.dispatchEvent(new CustomEvent("order:updated"));
    await loadLatestIntoManager();
    return true;
  };

  useEffect(() => {
    loadLatestIntoManager().catch(console.error);
  }, []);

  // ---- 末尾の注文/アイテムを保証 ----
  const ensureLastOrderExists = () => {
    if (manager.orderTable.length === 0) {
      const serial = Date.now();
      // AddOrder(serial, casherId, paymentType) 想定
      manager.AddOrder(serial, 1, paymentType);
    }
    return manager.orderTable.at(-1)!;
  };
  const ensureLastItemExists = () => {
    const lastOrder = ensureLastOrderExists() as any;
    if (lastOrder.order.length === 0) {
      lastOrder.Additem(); // flag=0 で1行追加される想定
    }
    return lastOrder.order.at(-1)!; // Flagインスタンス
  };

  // ---- 操作 ----
  // 焼うどん追加（flag:0）
  const addYakiudon = async () => {
    await loadLatestIntoManager();
    const last = ensureLastOrderExists() as any;
    last.Additem(); // 既存メソッド
    await writeManagerToServer();
  };

  // トッピング（OR固定）：最後のアイテムに AddFlag(bit)
  const applyTopping = async (rawFlag: unknown, idx: number) => {
    await loadLatestIntoManager();
    const bit = toBit(rawFlag, idx);
    const lastItem: any = ensureLastItemExists();
    lastItem.AddFlag(bit); // 既存メソッド（OR）
    await writeManagerToServer();
  };

  // トッピング全消し（flag=0）
  const clearToppings = async () => {
    await loadLatestIntoManager();
    const lastItem: any = ensureLastItemExists();
    // クリア用メソッドが無ければ直接 flag=0 代入でOK
    lastItem.flag = 0;
    await writeManagerToServer();
  };

  // 支払方法切替（readonlyプロパティには直代入しない）
  const togglePayment = async () => {
    await loadLatestIntoManager();
    const last: any = ensureLastOrderExists();
    const cur = last.PaymentType ?? last.paymentType ?? 1;
    const nextType = cur === 1 ? 2 : 1;

    const ok = setPaymentTypeOn(last, nextType);
    if (!ok) {
      console.error(
        "OrderTable に支払方法のsetter/変更用メソッドが見つかりませんでした。"
      );
      return;
    }
    setPaymentType(nextType);
    await writeManagerToServer();
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-5 grid-rows-4 gap-2 p-4">
        {/* トッピング（押すたび OR） */}
        {data.map((item, index) => (
          <div key={index} className="w-full">
            <button
              className="p-4 rounded w-full h-full text-xl bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-black disabled:opacity-50"
              onClick={() => applyTopping(item.Flag, index)}
              disabled={saving}
            >
              <div className="text-2xl">{item.item}</div>
              <div className="text-lg">￥{item.price}</div>
            </button>
          </div>
        ))}

        {/* 焼うどん追加 */}
        <div className="w-full">
          <button
            className="bg-orange-400 text-black text-2xl p-4 rounded w-full h-full hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50"
            disabled={saving}
            onClick={addYakiudon}
          >
            焼うどん追加
          </button>
        </div>

        {/* 支払方法切替 */}
        <div className="w-full">
          <button
            className="bg-yellow-300 text-black text-2xl p-4 rounded w-full h-full hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-50"
            disabled={saving}
            onClick={togglePayment}
          >
            {paymentType === 1 ? "金券" : "こいPay"}
          </button>
        </div>

        {/* クリア */}
        <div className="w-full">
          <button
            className="bg-slate-300 text-black text-2xl p-4 rounded w-full h-full hover:bg-slate-400 active:bg-slate-500 disabled:opacity-50"
            disabled={saving}
            onClick={clearToppings}
          >
            トッピングクリア
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 text-sm opacity-70">
        {saving ? "保存中…" : "　"}
      </div>
    </div>
  );
}
