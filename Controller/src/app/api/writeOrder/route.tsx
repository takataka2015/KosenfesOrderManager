import { NextResponse } from "next/server";
import fs from "fs";
import { FilePath } from "../../../../component/utility/format/filePath";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function saveNow(arr: any[]) {
  fs.writeFileSync(FilePath.Now, JSON.stringify(arr, null, 2), "utf-8");
}

// ✅ POST だけを export
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, error: "body must be an array" },
        { status: 400 }
      );
    }
    saveNow(body);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
