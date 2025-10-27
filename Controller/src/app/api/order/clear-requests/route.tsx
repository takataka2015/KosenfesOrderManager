import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../../component/utility/format/filePath";

function loadNow(): any[] {
  return JSON.parse(fs.readFileSync(FilePath.Now, "utf-8"));
}
function saveNow(arr: any[]) {
  fs.writeFileSync(FilePath.Now, JSON.stringify(arr, null, 2), "utf-8");
}
function appendHistory(obj: any) {
  fs.appendFileSync(
    FilePath.History,
    JSON.stringify(obj, null, 1) + ",\n",
    "utf-8"
  );
}

export async function POST() {
  try {
    const reqObj = JSON.parse(fs.readFileSync(FilePath.Request, "utf-8")) as {
      serials: number[];
    };
    const nowArr = loadNow();

    const removed: number[] = [];
    const remained: number[] = [];

    for (const s of reqObj.serials ?? []) {
      const idx = nowArr.findIndex((v) => !Array.isArray(v) && v?.serial === s);
      if (idx >= 0) {
        const removedObj = nowArr.splice(idx, 1)[0];
        appendHistory(removedObj);
        removed.push(s);
      } else {
        remained.push(s);
      }
    }

    saveNow(nowArr);
    fs.writeFileSync(
      FilePath.Request,
      JSON.stringify({ serials: remained }, null, 1),
      "utf-8"
    );

    return NextResponse.json({ ok: true, removed, remained });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
