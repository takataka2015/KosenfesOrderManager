import { NextResponse } from "next/server";
import {
  startAutoSweep,
  stopAutoSweep,
  isAutoSweepRunning,
} from "../../../../server/autoSweep";

export async function GET() {
  return NextResponse.json({ running: isAutoSweepRunning() });
}
export async function POST(req: Request) {
  const { action, intervalMs } = await req.json().catch(() => ({}));
  if (action === "start") {
    startAutoSweep(typeof intervalMs === "number" ? intervalMs : 1000);
    return NextResponse.json({ ok: true, running: true });
  }
  if (action === "stop") {
    stopAutoSweep();
    return NextResponse.json({ ok: true, running: false });
  }
  return NextResponse.json(
    { ok: false, error: "action must be 'start'|'stop'" },
    { status: 400 }
  );
}
