import { Menu } from "../../../component/utility/format/menu";
import { Flag } from "../../../component/utility/OrderTable";

export default function Order({
  index,
  flag,
  menu,
  onRemoveFlag,
  basePrice,
}: {
  index: number;
  flag: Flag;
  menu: Menu[];
  onRemoveFlag: (flagValue: number) => void; // 追加
  basePrice: number;
}) {
  return (
    <div
      key={index}
      className="w-full flex flex-col justify-start border-t-2 pl-1 pb-2"
    >
      <div className="font-bold flex justify-between items-center">
        {index}. 焼うどん
        <span>￥{basePrice}</span>
        <button
          className="w-15 h-10 rounded-md bg-amber-400
                   hover:bg-amber-500 active:bg-amber-600"
          onClick={() => onRemoveFlag(flag.flag)} // ← 自分の flag 値を渡す
        >
          削除
        </button>
      </div>

      {menu
        .filter((element: Menu) => flag.HasFlag(element.Flag ?? 0))
        .map((element, subIndex) => (
          <span
            key={`${element.Flag ?? element.Item}-${subIndex}`}
            className="w-full flex flex-row justify-between border-t-1 border-dashed px-2 font-regular"
          >
            <span className="flex">{element.Item}</span>
            <span className="flex">￥{element.Price}</span>
          </span>
        ))}
    </div>
  );
}
