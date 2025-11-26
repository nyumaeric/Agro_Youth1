"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useSessionSync(intervalMs = 10000) {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const isCheckingRef = useRef(false);

  const checkSession = useCallback(async () => {
    if (isCheckingRef.current || status !== "authenticated") {
      return;
    }

    isCheckingRef.current = true;

    try {
      const response = await fetch("/api/auth/check-session");
      const data = await response.json();

      if (data.needsRefresh) {
        console.log("Session outdated, refreshing...");
        await update();
        router.refresh();
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [status, update, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(checkSession, intervalMs);
    return () => clearInterval(interval);
  }, [checkSession, intervalMs, status]);
}