"use client";
import CurrentOrder from "../components/disp/CurrentOrder";
import ControllPanel from "../components/disp/ControllPanel";
import { useEffect, useState } from "react";

export default function Home() {
  const [order, setOrder] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    fetch("/api/readOrder", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => setOrder(undefined));
  }, []);

  return (
    <div className="font-sans flex flex-row min-h-screen">
      <div className="bg-amber-300 flex flex-col justify-between min-h-screen w-1/4 min-w-60 fixed">
        <CurrentOrder />
      </div>
      <div className="w-1/4 min-w-60"></div>
      <div className="bg-blue-300 grid max-h-screen w-3/4 min-w-180">
        <ControllPanel />
      </div>
    </div>
  );
}
