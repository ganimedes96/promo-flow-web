"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ConnectionAccountDetails } from "./connection-account-details";
import { ConnectionPanel } from "./connection-panel";
import { getWhatsAppSession } from "@/domains/whatsapp/client";
import {
  connectWhatsApp,
  disconnectWhatsApp,
} from "@/domains/whatsapp/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function WhatsAppConnection({
  connectionId,
  showWorkerIndicator = true,
  variant = "panel",
  onConnected,
}: {
  connectionId?: string;
  showWorkerIndicator?: boolean;
  variant?: "panel" | "sheet";
  onConnected?: () => void;
} = {}) {
  const account = useSession();
  const awaitingConnection = useRef(false);
  const session = useQuery({
    queryKey: [
      ...queryKeys.whatsapp.sessionFor(connectionId),
      account.data?.user.id,
    ],
    queryFn: () => getWhatsAppSession(connectionId),
    enabled: !!account.data?.user.id,
    refetchInterval: 3000,
  });
  const connect = useServerAction({
    mutationFn: () => connectWhatsApp(connectionId),
    invalidateQueries: [
      queryKeys.whatsapp.session,
      queryKeys.whatsapp.groups,
      queryKeys.whatsapp.connections,
      queryKeys.offers.all,
    ],
    successMessage: "Conexão solicitada. Aguarde o QR Code.",
  });
  const disconnect = useServerAction({
    mutationFn: () => disconnectWhatsApp(connectionId),
    invalidateQueries: [
      queryKeys.whatsapp.session,
      queryKeys.whatsapp.groups,
      queryKeys.whatsapp.connections,
      queryKeys.offers.all,
    ],
    successMessage: "Desconexão solicitada.",
  });
  const busy = connect.isPending || disconnect.isPending;
  const status = session.data?.status;
  const connected =
    status === "READY" &&
    !session.error &&
    session.data?.worker?.status === "ONLINE";
  useEffect(() => {
    if (
      status === "CONNECTING" ||
      status === "WAITING_QR" ||
      status === "AUTHENTICATED"
    ) {
      awaitingConnection.current = true;
    }
    if (status === "DISCONNECTED" || status === "ERROR") {
      awaitingConnection.current = false;
    }
    if (!connected || busy || !awaitingConnection.current || !onConnected)
      return;
    const timeout = window.setTimeout(() => {
      awaitingConnection.current = false;
      onConnected();
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [status, connected, busy, onConnected]);
  if (variant === "sheet") {
    return (
      <ConnectionAccountDetails
        session={session.data}
        loading={session.isPending}
        refreshing={session.isFetching}
        error={session.error}
        busy={busy}
        onConnect={() => connect.mutate()}
        onDisconnect={() => disconnect.mutate()}
        onRefresh={() => {
          void session.refetch();
        }}
      />
    );
  }
  return (
    <ConnectionPanel
      session={session.data}
      loading={session.isPending}
      refreshing={session.isFetching}
      error={session.error}
      busy={busy}
      showWorkerIndicator={showWorkerIndicator}
      onConnect={() => connect.mutate()}
      onDisconnect={() => disconnect.mutate()}
      onRefresh={() => {
        void session.refetch();
      }}
    />
  );
}
