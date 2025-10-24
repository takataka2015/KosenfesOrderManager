import orderNowData from "../../../informationLog/OrderNow.json";
import { OrderManager } from "../../../component/utility/OrderManager";
import menuConfig from "../../../informationLog/config/menuConfig.json";

const data = menuConfig.data;

export default function ControllPanel() {
  return (
    <div className="grid grid-cols-5 grid-rows-4 gap-2 p-4">
      <div className="w-full">
        <button
          className="bg-blue-400 text-black text-2xl p-4 rounded w-full h-full
            hover:bg-blue-500 active:bg-blue-600"
        >
          取り消し
        </button>
      </div>

      {data.map((item, index) => {
        return (
          <div key={index} className="w-full">
            <button
              className={`bg-blue-400 text-black text-xl p-4 rounded w-full h-full
            hover:bg-blue-500 active:bg-blue-600`}
            >
              <div className="text-2xl">{item.item}</div>
              <div className="text-lg"> ￥{item.price}</div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
