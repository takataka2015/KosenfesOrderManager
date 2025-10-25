"use client";
//import orderNowData from "../../../informationLog/OrderNow.json";
import { OrderManager } from "../../../component/utility/OrderManager";
import { OrderTable, Flag } from "../../../component/utility/OrderTable";
import menuConfig from "../../../informationLog/config/menuConfig.json";
import { useState, useEffect } from "react";

const data = menuConfig.data;

// シンプルな共有 OrderManager（このコンポーネント内の最小変更で動かすためのインスタンス）
const manager = new OrderManager();

export default function ControllPanel() {
  const [click, setClick] = useState(0);
  // PaymentType: 1=金券, 2=こいPay
  const [paymentType, setPaymentType] = useState<number>(1);
  // OrderNow.jsonのデータをローカルで保持
  const [orderNow, setOrderNow] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/readOrder", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`readOrder failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setOrderNow(data));
  }, []);

  // ControllPanel 内で使えるように最小のヘルパーを提供する
  const AddFlag = (index: number) => {
    // 最後の注文を取得（なければ新規作成）
    if (manager.orderTable.length === 0) {
      manager.AddOrder(1, 0, 0);
    }
    const lastOrder = manager.orderTable[manager.orderTable.length - 1];
    if (!lastOrder) return;

    // 注文にアイテムがなければ一つ追加
    if (lastOrder.order.length === 0) {
      lastOrder.Additem();
    }

    // 最後に追加した Flag インスタンスに対して AddFlag を呼ぶ
    const target = lastOrder.order[lastOrder.order.length - 1];
    target.AddFlag(index);
    console.log("AddFlag called", index, manager);
  };

  // PaymentTypeの表示名を定義
  const paymentTypeLabels: { [key: number]: string } = {
    1: "金券",
    2: "こいPay",
  };

  // OrderNow.jsonから最新のPaymentTypeを取得
  // ボタンがクリックされたときにPaymentTypeを交互に切り替え
  const handlePaymentTypeButtonClick = () => {
    // paymentTypeを切り替え
    const newType = paymentType === 1 ? 2 : 1;
    setPaymentType(newType);
    // OrderNow.jsonの末尾のpaymentTypeを変更
    if (orderNow.length > 0) {
      const updatedOrderNow = [...orderNow];
      updatedOrderNow[updatedOrderNow.length - 1] = {
        ...updatedOrderNow[updatedOrderNow.length - 1],
        paymentType: newType,
      };
      setOrderNow(updatedOrderNow);
      // API経由で保存
      fetch("/api/writeOrder/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOrderNow),
      });
    }
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-5 grid-rows-4 gap-2 p-4">
        {data.map((item, index) => {
          return (
            <div key={index} className="w-full">
              <button
                className="bg-blue-400 text-black text-xl p-4 rounded w-full h-full
            hover:bg-blue-500 active:bg-blue-600"
                onClick={() => {
                  AddFlag(index);
                }}
              >
                <div className="text-2xl">{item.item}</div>
                <div className="text-lg"> ￥{item.price}</div>
              </button>
            </div>
          );
        })}

        <div className="w-full">
          <button
            className="bg-red-400 text-black text-2xl p-4 rounded w-full h-full
            hover:bg-red-500 active:bg-red-600"
            onClick={() => {
              const neV = click + 1;
              setClick(neV);
              console.log(click);
            }}
          >
            取り消し
          </button>
        </div>

        <div className="w-full">
          <button
            className="bg-green-500 text-black text-2xl p-4 rounded w-full h-full
            hover:bg-green-600 active:bg-green-700"
            onClick={() => {
              const neV = click + 1;
              setClick(neV);
              console.log(click);
            }}
          >
            追加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 grid-rows-1 gap-4 p-4 pb-8 px-8 h-50 border-t-2">
        <button
          className="bg-yellow-300 text-black text-2xl p-4 rounded-2xl w-full h-full
            hover:bg-yellow-400 active:bg-yellow-600"
          onClick={handlePaymentTypeButtonClick}
        >
          {paymentTypeLabels[paymentType]}
        </button>
      </div>
    </div>
  );
}
