import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

export async function POST(req: Request) {
  try {
    // クライアントが application/json を送った場合は JSON としてパースし整形して書き込む。
    // それ以外はテキストを受け取り、可能なら JSON.parse して整形して書き込む。
    const contentType = req.headers.get("content-type") || "";
    let toWrite: string;
    if (contentType.includes("application/json")) {
      const obj = await req.json();
      toWrite = JSON.stringify(obj, null, 2);
    } else {
      const bodyText = await req.text();
      try {
        const parsed = JSON.parse(bodyText);
        toWrite = JSON.stringify(parsed, null, 2);
      } catch {
        // テキストが JSON ではない場合はそのまま書き込む
        toWrite = bodyText;
      }
    }
    fs.writeFileSync(FilePath.Now, toWrite, { encoding: "utf-8" });
    return NextResponse.json({ status: "ok" });
  } catch (e) {
    return NextResponse.json({ status: "error", message: String(e) });
  }
}
