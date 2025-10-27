import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../../component/utility/format/filePath";

export async function POST(req: Request) {
  const { serial } = await req.json();
  if (!Number.isFinite(serial)) {
    return NextResponse.json(
      { ok: false, error: "serial must be number" },
      { status: 400 }
    );
  }
  // OrderNow を読み込み
  const nowText = fs.readFileSync(FilePath.Now, "utf-8");
  const nowArr = JSON.parse(nowText) as any[];

  // 該当を検索（配列要素は履歴扱いなので、オブジェクトのみ対象）
  const idx = nowArr.findIndex(
    (v) => !Array.isArray(v) && v?.serial === serial
  );
  if (idx < 0) return NextResponse.json({ ok: false, found: false });

  const removed = nowArr.splice(idx, 1)[0];

  // Now を書き戻し
  fs.writeFileSync(FilePath.Now, JSON.stringify(nowArr, null, 2), "utf-8");

  // History は既存仕様に合わせて「1オブジェクト + カンマ」で追記
  fs.appendFileSync(
    FilePath.History,
    JSON.stringify(removed, null, 1) + ",",
    "utf-8"
  );

  return NextResponse.json({ ok: true, found: true, serial });
}
