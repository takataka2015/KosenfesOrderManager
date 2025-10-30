"use client";
import { useEffect, useRef, useState } from "react";
import menuConfig from "../../../informationLog/config/menuConfig.json";
import { OrderManager } from "../../../component/utility/OrderManager";
//import AcceptingOrder from "./AcceptingOrder";

// Flagが index でも bit 値でも動くように正規化（tsx内ユーティリティ）
const toBit = (raw: unknown, fallbackIndex: number) => {
  const n = Number(raw);
  if (Number.isFinite(n)) {
    // 1,2,4,8,... はそのまま
    if (n > 0 && (n & (n - 1)) === 0) return n;
    // 0,1,2,... は index とみなして 1<<index
    if (n >= 0) return 1 << n;
  }
  // 未定義など → ボタンindexからビット化
  return 1 << fallbackIndex;
};

const clampInt = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.floor(v)));

type OrderItem = { flag: number };
type OrderTable = {
  serial: number;
  casherId: number;
  paymentType?: number; // 実データ揺れ対策
  PaymentType?: number; // getter の可能性あり（代入しない）
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
  const [paymentType, setPaymentType] = useState(1);

  // 末尾が [] だったかを保持（読み込み後の1回の操作まで有効）
  const tailWasEmptyRef = useRef(false);

  // ★ 新規：整理券番号(1-40) / レジ番ID(1-45)
  const [serial, setSerial] = useState<number>(1);
  const [casherId, setCasherId] = useState<number>(1);

  // 初期復元
  useEffect(() => {
    const s = Number(localStorage.getItem("kosen:serial"));
    const c = Number(localStorage.getItem("kosen:casherId"));
    const p = Number(localStorage.getItem("kosen:paymentType"));
    if (Number.isFinite(s) && s >= 1 && s <= 40) setSerial(s);
    if (Number.isFinite(c) && c >= 1 && c <= 45) setCasherId(c);
    if (p === 1 || p === 2) setPaymentType(p);
  }, []);

  // 変更検知で保存
  useEffect(() => {
    localStorage.setItem("kosen:serial", String(serial));
  }, [serial]);

  useEffect(() => {
    localStorage.setItem("kosen:casherId", String(casherId));
  }, [casherId]);

  useEffect(() => {
    localStorage.setItem("kosen:paymentType", String(paymentType));
  }, [paymentType]);

  // ---- サーバ <-> Manager 同期 ----
  const loadLatestIntoManager = async () => {
    const res = await fetch("/api/readOrder", { cache: "no-store" });
    if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
    const json = await res.json();

    // 末尾が [] なら「履歴だけ」を Manager に読み込む
    const tail = Array.isArray(json) ? json[json.length - 1] : undefined;
    const safeForManager = Array.isArray(tail) ? json.slice(0, -1) : json;
    tailWasEmptyRef.current = Array.isArray(tail);

    manager.ReadOrder(safeForManager);

    const last: any = manager.orderTable.at(-1);
    if (last) {
      const pt = last.PaymentType ?? last.paymentType ?? 1;
      setPaymentType(pt);
    }
  };

  // ★ 末尾注文へ serial/casherId を確実にスタンプする（保存直前に毎回実行）
  const stampMetaToLastOrder = () => {
    const arr = JSON.parse(manager.WriteOrder()) as OrderTable[]; // ← クラスのreadonlyを回避
    if (!Array.isArray(arr) || arr.length === 0) {
      arr.push({
        serial,
        casherId,
        paymentType, // 既存UIの状態も保持
        receptionTime: Date.now(),
        order: [],
      });
    } else {
      const last = arr[arr.length - 1] as any;
      last.serial = clampInt(serial, 1, 40);
      last.casherId = clampInt(casherId, 1, 45);
      // PaymentType が getter の場合に備え、小文字側も保持
      if (
        typeof last.paymentType !== "number" &&
        typeof last.PaymentType === "number"
      ) {
        last.paymentType = last.PaymentType;
      }
    }
    manager.ReadOrder(arr);
  };

  const writeManagerToServer = async () => {
    // 保存直前に serial/casherId をスタンプ
    stampMetaToLastOrder();

    setSaving(true);
    const body = manager.WriteOrder(); // JSON文字列を返す前提
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
    // 表示側(CurrentOrder)へ更新通知 → 次操作のために最新を再読込
    window.dispatchEvent(new CustomEvent("order:updated"));
    await loadLatestIntoManager();
    return true;
  };

  useEffect(() => {
    loadLatestIntoManager().catch(console.error);
  }, []);

  // 整理券番号最大値
  const maxNum: any = 40;
  // ★ 注文確定後（CurrentOrder 側が発火）に整理券番号を +1（maxNum→1）
  useEffect(() => {
    const onConfirmed = () => setSerial((s) => (s % maxNum) + 1);
    window.addEventListener("order:confirmed", onConfirmed);
    return () => window.removeEventListener("order:confirmed", onConfirmed);
  }, []);

  // ---- 末尾の注文/アイテムを保証 ----
  const ensureActiveOrder = () => {
    if (manager.orderTable.length === 0 || tailWasEmptyRef.current) {
      // ★ ここで新しい注文配列を末尾に作成
      manager.AddOrder(Date.now(), casherId, paymentType);
      // 一度使ったらリセット（次の操作で誤判定しないように）
      tailWasEmptyRef.current = false;
    }
    return manager.orderTable.at(-1)!;
  };

  const ensureLastItemExists = () => {
    const lastOrder = ensureActiveOrder() as any;
    if (lastOrder.order.length === 0) lastOrder.Additem(); // flag=0 を1件
    return lastOrder.order.at(-1)!;
  };

  // ---- 操作 ----
  // 焼うどん追加（flag=0）
  const addYakiudon = async () => {
    await loadLatestIntoManager();
    const last = ensureActiveOrder() as any; // ★ ポイント
    last.Additem();
    await writeManagerToServer();
  };

  // トッピング（OR固定）：最後のアイテムに AddFlag(bit)
  const applyTopping = async (rawFlag: unknown, idx: number) => {
    await loadLatestIntoManager();
    const bit = toBit(rawFlag, idx);
    const lastItem: any = ensureLastItemExists(); // ★ ポイント
    lastItem.AddFlag(bit);
    await writeManagerToServer();
  };

  // トッピング全消し（flag=0）
  const clearToppings = async () => {
    await loadLatestIntoManager();
    const lastItem: any = ensureLastItemExists();
    // クリア用のメソッドが無くても flag を 0 にすればOK
    lastItem.flag = 0;
    await writeManagerToServer();
  };

  // 支払方法「明示セット」：末尾が [] のときは“新しい注文”を作ってから設定
  const setPayment = async (type: 1 | 2 | 3) => {
    await loadLatestIntoManager();

    // ← 重要：末尾が [] だった場合に必ず新規注文を作る
    ensureActiveOrder();

    // Managerの現在状態をJSON化 → “最後の注文”に対して支払/整理券/レジIDを反映
    const arr = JSON.parse(manager.WriteOrder()) as any[];
    const lastIdx = arr.length - 1;
    if (lastIdx >= 0 && arr[lastIdx] && !Array.isArray(arr[lastIdx])) {
      arr[lastIdx].paymentType = type; // getter回避のため小文字に書く
      arr[lastIdx].serial = Math.min(40, Math.max(1, Math.floor(serial)));
      arr[lastIdx].casherId = Math.min(45, Math.max(1, Math.floor(casherId)));
    } else if (lastIdx < 0 || Array.isArray(arr[lastIdx])) {
      // 念のため：履歴しかない or 末尾が配列なら、新規注文を1件足して設定
      arr.push({
        serial: Math.min(maxNum, Math.max(1, Math.floor(serial))),
        casherId: Math.min(45, Math.max(1, Math.floor(casherId))),
        paymentType: type,
        receptionTime: Date.now(),
        order: [],
      });
    }

    // 反映 → 保存
    manager.ReadOrder(arr);
    setPaymentType(type);
    await writeManagerToServer();
  };

  // ---- 入力ハンドラ（見た目はそのまま・機能だけ追加） ----
  const onChangeSerial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (Number.isFinite(v)) setSerial(clampInt(v, 1, maxNum));
  };
  const onChangeCasherId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (Number.isFinite(v)) setCasherId(clampInt(v, 1, 45));
  };

  return (
    <div className="flex flex-col justify-between">
      {/* Tailwind レイアウトは維持。順序：トッピング → クリア → 焼うどん追加 → 支払方法(2ボタン) */}
      <div className="grid grid-cols-5 gap-2 p-4">
        {/* トッピング（押すたびにOR） */}
        {data.map((item, index) => (
          <div key={index} className="w-full min-w-31">
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

        {/* クリア */}
        <div className="w-full">
          <button
            className="w-full h-full bg-slate-300 text-black text-2xl p-4 rounded hover:bg-slate-400 active:bg-slate-500 disabled:opacity-50"
            disabled={saving}
            onClick={clearToppings}
          >
            トッピング
            <br />
            クリア
          </button>
        </div>

        {/* 焼うどん追加 */}
        <div className="w-full">
          <button
            className="w-full h-full bg-orange-400 text-black text-2xl p-4 rounded hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50"
            disabled={saving}
            onClick={addYakiudon}
          >
            焼うどん
            <br />
            追加
          </button>
        </div>

        {/* 整理券番号入力（機能のみ付与） */}
        <div className="flex flex-row col-span-3 row-span-1 gap-2 justify-between">
          <div className="h-full w-1/2 flex items-center justify-between bg-lime-400 rounded-md p-2">
            <div className="flex justify-center items-center text-2xl">
              整理券番号
            </div>
            <input
              className="h-4/5 w-1/3 text-center text-2xl rounded-md bg-white"
              type="number"
              placeholder="3"
              min={1}
              max={maxNum}
              value={serial}
              onChange={onChangeSerial}
            />
          </div>
          <div className="h-full w-1/2 flex items-center justify-between bg-blue-400 rounded-md p-2">
            <div className="flex justify-center items-center text-2xl m-4">
              レジ番ID
            </div>
            <input
              className=" h-4/5 w-1/3 text-center text-2xl rounded-md bg-white"
              type="number"
              placeholder="出席番号"
              min={1}
              max={45}
              maxLength={2}
              value={casherId}
              onChange={onChangeCasherId}
            />
          </div>
        </div>

        {/* 支払方法（4ボタン） */}
        <div className="w-full col-span-3">
          <div className="flex gap-2">
            <button
              className={`flex-1 text-2xl p-4 rounded ${
                paymentType === 1 ? "bg-yellow-500" : "bg-yellow-200"
              } hover:opacity-50 disabled:opacity-100`}
              disabled={saving}
              onClick={() => setPayment(1)}
            >
              金券
            </button>
            <button
              className={`flex-1 text-2xl p-4 rounded ${
                paymentType === 2 ? "bg-yellow-500" : "bg-yellow-200"
              } hover:opacity-50 disabled:opacity-100`}
              disabled={saving}
              onClick={() => setPayment(2)}
            >
              PayPay
            </button>
            <button
              className={`flex-1 text-2xl p-4 rounded ${
                paymentType === 3 ? "bg-yellow-500" : "bg-yellow-200"
              } hover:opacity-50 disabled:opacity-100`}
              disabled={saving}
              onClick={() => setPayment(3)}
            >
              その他
              <br />
              キャッシュレス
            </button>
          </div>
        </div>
      </div>
      {/* <AcceptingOrder /> */}
    </div>
  );
}
