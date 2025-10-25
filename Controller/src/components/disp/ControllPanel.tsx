"use client";

import { useEffect, useRef, useState } from "react";
import menuConfig from "../../../informationLog/config/menuConfig.json";
import { OrderManager } from "../../../component/utility/OrderManager";

// Flagが「ビット値」か「インデックス」かを自動判定してビット化
const toBit = (v: number) => {
  const n = Number(v);
  if (Number.isFinite(n) && n > 0 && (n & (n - 1)) === 0) return n; // 1,2,4,8,...
  return 1 << n; // 0,1,2,... を 1<<n に
};

type ToppingMode = "or" | "set" | "xor";

export default function ControllPanel() {
  const data = menuConfig.data as Array<{
    item: string;
    price: number;
    Flag: number;
  }>;

  // OrderManager は参照一定（useRef）で保持
  const managerRef = useRef(new OrderManager());
  const manager = managerRef.current;

  const [saving, setSaving] = useState(false);
  const [paymentType, setPaymentType] = useState<number>(1);
  const [toppingMode, setToppingMode] = useState<ToppingMode>("or");

  // ---- サーバとOrderManagerの同期 ----
  const loadLatestIntoManager = async () => {
    const res = await fetch("/api/readOrder", { cache: "no-store" });
    if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
    const json = await res.json();
    manager.ReadOrder(json);
    // 末尾の支払い方法をUIに反映（OrderManager側の命名に合わせる）
    const last = manager.orderTable.at(-1);
    if (last) {
      // OrderTableのプロパティ名は Manager に合わせる（PaymentType/ paymentType どちらでもOKに）
      const pt = (last as any).PaymentType ?? (last as any).paymentType ?? 1;
      setPaymentType(pt);
    }
  };

  const writeManagerToServer = async () => {
    setSaving(true);
    const body = manager.WriteOrder(); // Managerが正しい構造でJSON文字列を返す
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
    // 表示側(CurrentOrder)にも更新通知
    window.dispatchEvent(new CustomEvent("order:updated"));
    // 念のため最新を再読込して Manager とサーバの乖離を防止
    await loadLatestIntoManager();
    return true;
  };

  // 初期ロード
  useEffect(() => {
    loadLatestIntoManager().catch(console.error);
  }, []);

  // ---- ユーティリティ（末尾の注文・末尾アイテムを保証） ----
  const ensureLastOrderExists = () => {
    if (manager.orderTable.length === 0) {
      // 引数シグネチャはプロジェクトの定義に依存
      // だいたい (serial, casherId, paymentType) など
      const serial = Date.now();
      manager.AddOrder(serial, 1, paymentType);
    }
    return manager.orderTable.at(-1)!;
  };

  const ensureLastItemExists = () => {
    const lastOrder = ensureLastOrderExists();
    if (lastOrder.order.length === 0) {
      lastOrder.Additem(); // flag=0 のアイテムが追加される前提
    }
    return lastOrder.order.at(-1)!; // Flagインスタンス
  };

  // ---- 操作系 ----
  // 焼うどん（flag:0）を1つ追加
  const addYakiudon = async () => {
    await loadLatestIntoManager();
    const lastOrder = ensureLastOrderExists();
    lastOrder.Additem(); // 1行追加（flag=0）
    await writeManagerToServer();
  };

  // トッピング：既存メソッドを使用（AddFlag/RemoveFlag/HasFlag）
  const applyTopping = async (raw: number) => {
    await loadLatestIntoManager();
    const bit = toBit(raw);
    const lastItem = ensureLastItemExists();

    if (toppingMode === "or") {
      lastItem.AddFlag(bit); // 既存：ORでビットを立てる
    } else if (toppingMode === "set") {
      // 一度クリアしてから AddFlag（Clearメソッドが無ければflag=0代入）
      (lastItem as any).flag = 0;
      lastItem.AddFlag(bit);
    } else {
      // xor: 付いていれば外す、無ければ付ける
      if (lastItem.HasFlag(bit)) {
        lastItem.RemoveFlag(bit);
      } else {
        lastItem.AddFlag(bit);
      }
    }

    await writeManagerToServer();
  };

  // トッピング全クリア（flag=0）
  const clearToppings = async () => {
    await loadLatestIntoManager();
    const lastItem = ensureLastItemExists();
    (lastItem as any).flag = 0;
    await writeManagerToServer();
  };

  // 支払方法切替（OrderTableのプロパティ名差異に対応）
  const togglePayment = async () => {
    await loadLatestIntoManager();
    const last = ensureLastOrderExists();
    const cur = (last as any).PaymentType ?? (last as any).paymentType ?? 1;
    const nextType = cur === 1 ? 2 : 1;
    if ("PaymentType" in last) (last as any).PaymentType = nextType;
    if ("paymentType" in last) (last as any).paymentType = nextType;
    setPaymentType(nextType);
    await writeManagerToServer();
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-5 grid-rows-5 gap-2 p-4">
        {/* モード切替 & クリア */}
        <div className="col-span-5 flex gap-2 items-center mb-1">
          <button
            className={`px-3 py-2 rounded ${
              toppingMode === "or" ? "bg-emerald-400" : "bg-gray-300"
            } hover:opacity-90`}
            onClick={() => setToppingMode("or")}
            disabled={saving}
          >
            OR追加
          </button>
          <button
            className={`px-3 py-2 rounded ${
              toppingMode === "set" ? "bg-emerald-400" : "bg-gray-300"
            } hover:opacity-90`}
            onClick={() => setToppingMode("set")}
            disabled={saving}
          >
            SET上書き
          </button>
          <button
            className={`px-3 py-2 rounded ${
              toppingMode === "xor" ? "bg-emerald-400" : "bg-gray-300"
            } hover:opacity-90`}
            onClick={() => setToppingMode("xor")}
            disabled={saving}
          >
            XORトグル
          </button>
          <div className="flex-1" />
          <button
            className="px-3 py-2 rounded bg-orange-300 hover:bg-orange-400 disabled:opacity-50"
            onClick={clearToppings}
            disabled={saving}
          >
            トッピングクリア
          </button>
        </div>

        {/* トッピング（既存メソッドで最後のflagに反映） */}
        {data.map((item, index) => (
          <div key={index} className="w-full">
            <button
              className="p-4 rounded w-full h-full text-xl bg-blue-400 hover:bg-blue-500 active:bg-blue-600 text-black disabled:opacity-50"
              onClick={() => applyTopping(item.Flag)}
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
      </div>

      <div className="px-4 pb-4 text-sm opacity-70">
        {saving ? "保存中…" : "　"}
      </div>
    </div>
  );
}
