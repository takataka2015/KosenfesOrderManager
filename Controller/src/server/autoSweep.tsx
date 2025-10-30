// Unity側で指定された受付番号を確認し自動的に削除
import fs from "fs";
import { FilePath } from "../../component/utility/format/filePath";

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

export function runOnce() {
  // コンソール確認用
  //console.log("[autoSweep] runOnce triggered at", new Date().toLocaleTimeString());
  const reqObj = JSON.parse(fs.readFileSync(FilePath.Request, "utf-8")) as {
    serials: number[];
  };
  const nowArr = loadNow();

  const remained: number[] = [];
  for (const s of reqObj.serials ?? []) {
    const idx = nowArr.findIndex((v) => !Array.isArray(v) && v?.serial === s);
    if (idx >= 0) {
      const removedObj = nowArr.splice(idx, 1)[0];
      appendHistory(removedObj);
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
}

// ── タイマー管理（型エラー回避のため ReturnType<typeof setInterval> を使用） ──
const GLOBAL_KEY = "__kosen_auto_sweep_timer__" as const;
type G = typeof globalThis & { [GLOBAL_KEY]?: ReturnType<typeof setInterval> };

export function startAutoSweep(intervalMs = 1000) {
  const g = globalThis as G;
  if (g[GLOBAL_KEY]) return;
  g[GLOBAL_KEY] = setInterval(() => {
    try {
      runOnce();
    } catch (e) {
      console.error("auto-sweep error:", e);
    }
  }, intervalMs);
}
export function stopAutoSweep() {
  const g = globalThis as G;
  if (!g[GLOBAL_KEY]) return;
  clearInterval(g[GLOBAL_KEY]!);
  delete g[GLOBAL_KEY];
}
export function isAutoSweepRunning() {
  const g = globalThis as G;
  return !!g[GLOBAL_KEY];
}
