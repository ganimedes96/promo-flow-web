import type { WhatsAppSession } from "./types";

export const connectionBadgeStyles = {
  connected: "border-emerald-700 bg-emerald-700 text-white font-semibold",
  waiting: "border-amber-300 bg-amber-300 text-amber-950 font-semibold",
  qr: "border-blue-700 bg-blue-700 text-white font-semibold",
  connecting: "border-violet-700 bg-violet-700 text-white font-semibold",
  authenticated: "border-cyan-800 bg-cyan-800 text-white font-semibold",
  error: "border-rose-700 bg-rose-700 text-white font-semibold",
  disconnected: "border-orange-700 bg-orange-700 text-white font-semibold",
} as const;

export function getConnectionBadgeStyle(
  status: WhatsAppSession["status"],
  online: boolean
) {
  switch (status) {
    case "READY":
      return online
        ? connectionBadgeStyles.connected
        : connectionBadgeStyles.waiting;
    case "WAITING_QR":
      return connectionBadgeStyles.qr;
    case "CONNECTING":
      return connectionBadgeStyles.connecting;
    case "AUTHENTICATED":
      return connectionBadgeStyles.authenticated;
    case "ERROR":
      return connectionBadgeStyles.error;
    case "DISCONNECTED":
      return connectionBadgeStyles.disconnected;
  }
}
