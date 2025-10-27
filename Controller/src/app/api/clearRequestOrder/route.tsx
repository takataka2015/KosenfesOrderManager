import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

export async function POST() {
  const reqObj = JSON.parse(fs.readFileSync(FilePath.Request, "utf-8")) as {
    serials: number[];
  };
  const nowArr = JSON.parse(fs.readFileSync(FilePath.Now, "utf-8")) as any[];

  const removed: number[] = [];
  const remained: number[] = [];

  for (const s of reqObj.serials ?? []) {
    const idx = nowArr.findIndex((v) => !Array.isArray(v) && v?.serial === s);
    if (idx >= 0) {
      const removedObj = nowArr.splice(idx, 1)[0];
      fs.appendFileSync(
        FilePath.History,
        JSON.stringify(removedObj, null, 1) + ",",
        "utf-8"
      );
      removed.push(s);
    } else {
      remained.push(s);
    }
  }

  // 反映
  fs.writeFileSync(FilePath.Now, JSON.stringify(nowArr, null, 2), "utf-8");
  fs.writeFileSync(
    FilePath.Request,
    JSON.stringify({ serials: remained }, null, 1),
    "utf-8"
  );

  return NextResponse.json({ ok: true, removed, remained });
}
