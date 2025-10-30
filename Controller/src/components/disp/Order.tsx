import { Menu } from "../../../component/utility/format/menu";
import { Flag } from "../../../component/utility/OrderTable";

export default function Order({
  index,
  flag,
  menu,
  onRemove,
  basePrice,
}: {
  index: number;
  flag: Flag;
  menu: Menu[];
  onRemove: (rowIndex: number) => void;
  basePrice: number;
}) {
  return (
    <div className="w-full flex flex-col text-xl justify-start border-t-2 pl-1">
      <div className="font-bold flex justify-between items-center">
        <span className="flex flex-row items-between">
          {index}. 焼うどん
          <span>　￥{basePrice}</span>
        </span>

        <button
          className="w-17 h-12 m-1 rounded-md bg-amber-400 hover:bg-amber-500 active:bg-amber-600"
          onClick={() => onRemove(index)}
        >
          削除
        </button>
      </div>

      {menu
        .filter((m) => flag.HasFlag(m.Flag ?? 0))
        .map((m, subIndex) => (
          <span
            key={`${m.Flag ?? m.Item}-${subIndex}`}
            className="w-full flex flex-row justify-between border-t-1 border-dashed px-2 py-1 font-regular"
          >
            <span className="flex">{m.Item}</span>
            <span className="flex">￥{m.Price}</span>
          </span>
        ))}
    </div>
  );
}
