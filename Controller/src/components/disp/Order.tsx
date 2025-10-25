import { Menu } from "../../../component/utility/format/menu";
import { Flag } from "../../../component/utility/OrderTable";

export default function Order({
  index,
  flag,
  menu,
  onRemove,
}: {
  index: number;
  flag: Flag;
  menu: Menu[];
  onRemove: (rowIndex: number) => void;
}) {
  return (
    <div className="w-full flex flex-col justify-start border-t-2 pl-1 pb-2">
      <div className="font-bold flex justify-between items-center">
        {index}. 焼うどん
        <button
          className="w-15 h-10 rounded-md bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:opacity-50"
          onClick={() => onRemove(index)}
          disabled={false}
        >
          削除
        </button>
      </div>
      {menu
        .filter((m) => flag.HasFlag(m.Flag ?? 0))
        .map((m, i) => (
          <span
            key={`${m.Flag ?? m.Item}-${i}`}
            className="w-full flex justify-between border-t border-dashed px-2"
          >
            <span>{m.Item}</span>
            <span>￥{m.Price}</span>
          </span>
        ))}
    </div>
  );
}
