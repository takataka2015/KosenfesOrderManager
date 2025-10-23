import orderNowData from "../../../informationLog/OrderNow.json";
import { OrderManager } from "../../../component/utility/OrderManager";

type OrderNowItem = {
  serial: number;
  casherId: number;
  order: number[];
  paymentType: number;
  receptionTime: number;
  price: number;
};

const orderManager = new OrderManager();
const findNum = 1;

export default function CurrentOrder() {
  const items = orderNowData as OrderNowItem[];
  const _serial = items.find((x) => x.serial === findNum);

  return (
    <div className="flex flex-col gap-4 h-screen">
      <div className="bg-amber-500 p-3 flex justify-center font-semibold sticky top-0 z-10">
        現在の注文
      </div>

      <div className="flex-1 flex flex-col items-start overflow-y-auto pb-40">
        <div className="w-full flex flex-col items-start pb-3">
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
          <div className="w-full flex flex-col justify-start border-t-2 pl-1">
            {orderManager.menu.map((m, idx) => (
              <div
                key={idx}
                className="w-full flex justify-between border-t-1 border-dashed px-2 py-1"
              >
                <span>{m.Item}</span>
                <span className="font-normal">¥{m.Price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed flex flex-col items-start h-30 bottom-0 left-0 w-25/100 min-w-50 bg-amber-400 shadow-lg z-20">
        <div className="w-full border-t-2 font-bold p-2">
          合計
          <div className="w-95/100 flex flex-col items-end border-t-1 border-dashed text-xl">
            ￥908
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
