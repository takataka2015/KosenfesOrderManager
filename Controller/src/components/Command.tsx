"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

export default function KonamiListener({
  to = "/employeeManagement",
}: {
  to?: string;
}) {
  const router = useRouter();
  const buf = useRef<string[]>([]);
  const triggered = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 入力欄でのタイプは無視したい場合はガード
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      if (triggered.current) return;

      const k = e.key.toLowerCase();
      buf.current = [...buf.current, k].slice(-KONAMI.length);

      if (buf.current.join(",") === KONAMI.join(",")) {
        triggered.current = true;
        // 同期中のレンダーに干渉しないよう、tickの末尾にずらす
        setTimeout(() => {
          router.push(to);
        }, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, to]);

  return null;
}
