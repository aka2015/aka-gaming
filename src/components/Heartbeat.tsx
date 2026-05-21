"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Heartbeat() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;

    function ping() {
      fetch("/api/online", { method: "POST" }).catch(() => {});
    }

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.email]);

  return null;
}
