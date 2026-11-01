"use client";
import { useCallback, useEffect, useState } from "react";
type Status =
  | "checking"
  | "missing"
  | "disconnected"
  | "connected"
  | "unavailable";
export function useExtensionStatus(userId: string) {
  const [status, setStatus] = useState<Status>("checking");
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    const requestId = crypto.randomUUID();
    let installed = false;
    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        typeof event.data !== "object" ||
        event.data === null
      )
        return;
      const data = event.data as Record<string, unknown>;
      if (data.type === "PROMOFLOW_EXTENSION_READY") installed = true;
      if (
        data.type !== "PROMOFLOW_EXTENSION_STATUS_RESULT" ||
        data.requestId !== requestId
      )
        return;
      clearTimeout(detection);
      clearTimeout(expiration);
      setStatus(
        data.ok !== true
          ? "unavailable"
          : data.accountId === userId
            ? "connected"
            : "disconnected"
      );
    };
    const startedAt = Date.now();
    const onFocus = () => {
      if (Date.now() - startedAt > 10000) refresh();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("message", receive);
    const detection = setTimeout(
      () => setStatus(installed ? "checking" : "missing"),
      1600
    );
    const expiration = setTimeout(
      () => setStatus(installed ? "unavailable" : "missing"),
      25000
    );
    window.postMessage({ type: "PROMOFLOW_EXTENSION_HELLO" }, location.origin);
    window.postMessage(
      { type: "PROMOFLOW_EXTENSION_STATUS", requestId },
      location.origin
    );
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("message", receive);
      clearTimeout(detection);
      clearTimeout(expiration);
    };
  }, [userId, attempt, refresh]);
  return { status, refresh };
}
