"use client";

import React, { useEffect, useState } from "react";

type OrderItem = { flag: number };
type OrderTable = {
  serial: number;
  casherId: number;
  paymentType: number;
  receptionTime: number;
  order: OrderItem[];
};

export default function AcceptingOrder() {
  const [orders, setOrders] = useState<OrderTable[]>([]);

  // OrderNow.jsonの内容を定期的に取得
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/readOrder", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        // 有効な注文オブジェクトだけを抽出
        const valid = Array.isArray(data)
          ? data.filter((v) => !Array.isArray(v))
          : [];
        setOrders(valid);
      } catch (e) {
        console.error(e);
      }
    };
    fetchOrders();
    const timer = setInterval(fetchOrders, 1000); // 1秒ごとに更新
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-3">受付済み注文一覧</h2>
      <div className="grid grid-cols-5">
        {orders.length === 0 ? (
          <div className="text-gray-500">現在受付中の注文はありません。</div>
        ) : (
          orders.map((o) => (
            <div
              key={o.serial}
              className="flex flex-col border rounded-lg p-3 mb-2 bg-white shadow-sm"
            >
              <div className="font-semibold">整理券番号: {o.serial}</div>
              <div className="text-sm text-gray-700">
                注文内容：
                {o.order.length === 0 ? (
                  <span className="text-gray-400 ml-1">未定</span>
                ) : (
                  <ul className="list-disc list-inside">
                    {o.order.map((item, i) => (
                      <li key={i}>flag: {item.flag}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
