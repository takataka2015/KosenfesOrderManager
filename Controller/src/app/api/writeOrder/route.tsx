import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

export async function POST(req: Request) {
  // リクエストのボディ は orderTable が テキスト（文字列） 形式で送られてくることを想定
  const body = await req.text();
  const json = fs.writeFileSync(
    FilePath.Now,
    JSON.stringify(body, undefined, " "),
    { encoding: "utf-8" }
  );
  return NextResponse.json({ status: "ok" });
}
