import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

export async function GET() {
  const json = fs.readFileSync(FilePath.Now, { encoding: "utf-8" });
  const obj = JSON.parse(json);
  return NextResponse.json(obj);
}
