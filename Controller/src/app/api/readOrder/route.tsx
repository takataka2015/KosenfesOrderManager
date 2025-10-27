import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

// 設定は「許可リスト」の中からのみ export 可能
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function loadNow(): any[] {
  return JSON.parse(fs.readFileSync(FilePath.Now, "utf-8"));
}

// ✅ 許可されたハンドラ名で export
export async function GET() {
  try {
    const data = loadNow();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
