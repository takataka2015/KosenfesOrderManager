import orderNowData from "../../../informationLog/OrderNow.json";

type OrderNowItem = {
  serial: number;
  casherId: number;
  order: number[];
  paymentType: number;
  receptionTime: number;
  price: number;
};

let findnum = 1;

export default function CurrentOrder() {
  const items = orderNowData as OrderNowItem[];
  const serial = items.find((x) => x.serial === findnum);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-500 p-3 flex justify-center font-semibold">
        現在の注文
      </div>

      <div className="flex flex-col items-start">
        <div className="w-9/10 flex flex-col items-start pb-3">
          <div className="w-full flex justify-start border-t-2 font-bold pl-1">
            やきうどん
          </div>
          <div className="w-full flex justify-start border-t-1 border-dashed pl-3">
            いちご
          </div>
          <div className="w-full flex justify-start border-t-1 border-dashed pl-3">
            ずっとマヨネーズでいいのに。
          </div>
        </div>
      </div>

      {/* デバッグ用…？ */}
      <div className="p-3 border rounded">
        <div className="font-bold">serial={findnum}</div>
        {serial ? (
          <div className="mt-2 text-sm">
            <div>casherId: {serial.casherId}</div>
            <div>order: {serial.order.join(", ")}</div>
            <div>paymentType: {serial.paymentType}</div>
            <div>receptionTime: {serial.receptionTime}</div>
            <div>price: {serial.price}</div>
          </div>
        ) : (
          <div className="text-red-600">
            serial={findnum} の注文が見つかりません。
          </div>
        )}
      </div>
    </div>
  );
}
