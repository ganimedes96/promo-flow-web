"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Send,
  Copy,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createTelegramPublisherLink } from "@/domains/telegram-publisher/actions";
import { getTelegramPublisherStatus } from "@/domains/telegram-publisher/client";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { formatDate } from "@/utils/date";
export function TelegramLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [baseline, setBaseline] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const status = useQuery({
    queryKey: queryKeys.telegramPublisher.status,
    queryFn: getTelegramPublisherStatus,
    enabled: open,
    retry: false,
    refetchInterval: open ? 10000 : false,
  });
  const groups = useQuery({
    queryKey: queryKeys.whatsapp.groupsFor(session?.user.id),
    queryFn: () => getWhatsAppGroups(),
    enabled: open,
    retry: false,
    refetchInterval: open ? 5000 : false,
  });
  const create = useServerAction({
    mutationFn: createTelegramPublisherLink,
    disableSuccessToast: true,
    onSuccess: () => {
      setCopied(false);
      setCopyError(false);
      setBaseline(
        (groups.data ?? [])
          .filter((g) => g.platform === "TELEGRAM")
          .map((g) => g.id)
      );
    },
  });
  const result = create.data?.data;
  const linked =
    baseline !== null &&
    groups.data?.some(
      (group) => group.platform === "TELEGRAM" && !baseline.includes(group.id)
    );
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          create.reset();
          setBaseline(null);
          setCopied(false);
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="text-primary size-5" />
            Publicar no Telegram
          </DialogTitle>
          <DialogDescription>
            Vincule grupos ou canais que você administra. O bot publica suas
            ofertas sem precisar conectar sua conta pessoal.
          </DialogDescription>
        </DialogHeader>
        {status.isPending ? (
          <Skeleton className="h-12 rounded-xl" />
        ) : (
          <Badge variant="outline" className="w-fit">
            {status.data?.online ? "Bot online" : "Bot indisponível"}
          </Badge>
        )}
        {(create.error || status.error) && (
          <p role="alert" className="text-destructive text-sm">
            {create.error?.message ||
              "Não foi possível consultar o bot. Atualize e tente novamente."}
          </p>
        )}
        <ol className="space-y-3 text-sm">
          {[
            "Adicione o bot ao grupo ou canal e promova-o a administrador com permissão para publicar.",
            "Gere um código abaixo e publique o comando no próprio grupo ou canal. Em grupos, você também precisa ser administrador.",
            "Quando o destino aparecer em Grupos, marque-o como favorito e escolha-o ao preparar sua oferta.",
          ].map((step, index) => (
            <li
              key={step}
              className="bg-primary/5 flex gap-3 rounded-xl border p-3"
            >
              <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {status.data?.username && (
          <Button asChild variant="outline">
            <a
              href={"https://t.me/" + encodeURIComponent(status.data.username)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir @{status.data.username}
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}
        {linked ? (
          <div
            role="status"
            className="bg-primary/10 motion-safe:animate-in motion-safe:fade-in flex items-start gap-3 rounded-xl border p-4"
          >
            <CheckCircle2 className="text-primary size-6 shrink-0" />
            <div>
              <p className="font-semibold">Destino vinculado!</p>
              <p className="text-muted-foreground text-sm">
                Favorite o grupo ou canal para disponibilizá-lo nas suas
                ofertas.
              </p>
            </div>
          </div>
        ) : (
          result && (
            <div className="bg-primary/5 space-y-3 rounded-xl border p-4">
              <p className="text-xs font-medium">
                Publique este comando no destino
              </p>
              <code className="bg-background block rounded-lg border p-3 text-xs break-all">
                {result.command}
              </code>
              <p className="text-muted-foreground text-xs">
                Válido até {formatDate(result.expiresAt, "HH:mm")}. Uso único;
                não compartilhe fora do destino desejado.
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.command);
                    setCopied(true);
                    setCopyError(false);
                  } catch {
                    setCopyError(true);
                  }
                }}
              >
                <Copy className="size-4" />
                {copied ? "Comando copiado" : "Copiar comando"}
              </Button>
              {copyError && (
                <p className="text-destructive text-xs">
                  Selecione e copie o comando manualmente.
                </p>
              )}
            </div>
          )
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={create.isPending || !status.data?.online}
            onClick={() => create.mutate()}
          >
            <RefreshCw
              className={create.isPending ? "size-4 animate-spin" : "size-4"}
            />
            {result ? "Gerar outro código" : "Gerar código de vínculo"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/groups">Ver grupos e canais</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Cada destino consome o limite de grupos do seu plano. Publicações no
          Telegram e WhatsApp compartilham a cota diária. O worker precisa estar
          ligado.
        </p>
      </DialogContent>
    </Dialog>
  );
}
