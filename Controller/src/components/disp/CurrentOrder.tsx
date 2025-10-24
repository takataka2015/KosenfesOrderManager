"use client";
import { Menu } from "../../../component/utility/format/menu";
import orderNowData from "../../../informationLog/OrderNow.json";
import { OrderManager } from "../../../component/utility/OrderManager";
import { OrderTable, Flag } from "../../../component/utility/OrderTable";
import Order from "./Order";
import { useEffect, useState } from "react";

export default function CurrentOrder({ order }: { order: any }) {
  const orderManager = new OrderManager();
  orderManager.ReadOrder(order);

  const moneyCalc = (menu: Menu[], flag: Flag) => {
    return menu
      .filter((element: Menu) => flag.HasFlag(element.Flag ?? 0))
      .reduce((previous: number, current: Menu) => previous + current.Price, 0);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-amber-500 p-3 flex justify-center font-semibold sticky top-0 z-10">
        現在の注文
      </div>
      <div className="w-full flex-1 flex flex-col items-start overflow-y-auto pb-40">
        <div className="w-full flex flex-col items-start pb-3" id="order-list">
          {orderManager.orderTable
            .at(-1)
            ?.order.map((flag: Flag, index: number) => (
              <Order
                key={index}
                index={index}
                flag={flag}
                menu={orderManager.menu}
              />
            ))}
        </div>
      </div>

      <div className="fixed flex flex-col items-start h-30 bottom-0 left-0 w-25/100 min-w-50 bg-amber-400 shadow-lg z-20">
        <div className="w-full border-t-2 font-bold p-2">
          合計
          <div className="w-95/100 flex flex-col items-end border-t-1 border-dashed text-xl">
            ￥
            {orderManager.orderTable
              .at(-1)
              ?.order.reduce(
                (previous, current) =>
                  previous + moneyCalc(orderManager.menu, current),
                0
              )}
          </div>
          <div className="w-full flex justify-end py-2">
            <button
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded
              hover:bg-amber-700 active:bg-amber-800 
              transform transition-all duration-100 
              hover:scale-105 active:scale-95 
              hover:shadow-md active:shadow-inner"
            >
              注文確定
            </button>
          </div>
        </div>
      </div>
      {/* 固定フッターの高さ分の空白を追加 */}
      <div className="h-20"></div>
    </div>
  );
}
