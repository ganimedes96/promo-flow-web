import { ArrowDownRight, ArrowUpRight, CircleAlert, Users } from "lucide-react";
import { WhatsAppGroup } from "@/domains/whatsapp/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/utils/date";
export const GROUP_CAPACITY_REFERENCE = 1024;
export function isNearFull(group: WhatsAppGroup) {
  return (
    !group.isCommunity &&
    group.participantCount != null &&
    group.participantCount >= Math.ceil(GROUP_CAPACITY_REFERENCE * 0.9) &&
    group.participantCount <= GROUP_CAPACITY_REFERENCE
  );
}
export function GroupMetrics({ group }: { group: WhatsAppGroup }) {
  const count = group.participantCount;
  const hasCount = count != null;
  const hasCapacity =
    hasCount && !group.isCommunity && count <= GROUP_CAPACITY_REFERENCE;
  const nearFull = isNearFull(group);
  return (
    <div className="mt-3 max-w-xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Users className="text-muted-foreground size-3.5" />
            {hasCount ? count.toLocaleString("pt-BR") : "—"}
            <span className="text-muted-foreground text-xs font-normal">
              participantes
            </span>
          </span>
          {nearFull && (
            <Badge
              className={
                count === GROUP_CAPACITY_REFERENCE
                  ? "bg-rose-700 text-white"
                  : "bg-orange-600 text-white"
              }
            >
              <CircleAlert className="size-3" />
              {count === GROUP_CAPACITY_REFERENCE
                ? "No limite de referência"
                : "Quase lotado"}
            </Badge>
          )}
          {group.isCommunity && <Badge variant="outline">Comunidade</Badge>}
        </div>
        {group.growthTrackedFrom ? (
          <div
            className="flex items-center gap-2 text-xs"
            title={`Eventos registrados hoje. Monitoramento iniciado em ${formatDate(group.growthTrackedFrom, "dd/MM/yyyy HH:mm")}`}
          >
            <span className="flex items-center text-emerald-700 dark:text-emerald-300">
              <ArrowUpRight className="size-3.5" />+{group.joinedToday ?? 0}
            </span>
            <span className="flex items-center text-rose-700 dark:text-rose-300">
              <ArrowDownRight className="size-3.5" />−{group.leftToday ?? 0}
            </span>
            <span className="text-muted-foreground">hoje</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">
            Histórico ainda não iniciado
          </span>
        )}
      </div>
      {hasCapacity ? (
        <div className="space-y-1">
          <Progress
            value={Math.min(100, (count / GROUP_CAPACITY_REFERENCE) * 100)}
            aria-label={`Ocupação de referência: ${count} de ${GROUP_CAPACITY_REFERENCE}`}
            className={
              nearFull ? "[&_[data-slot=progress-indicator]]:bg-orange-500" : ""
            }
          />
          <p className="text-muted-foreground text-[10px]">
            {Math.round((count / GROUP_CAPACITY_REFERENCE) * 100)}% de uma
            referência de {GROUP_CAPACITY_REFERENCE.toLocaleString("pt-BR")}{" "}
            participantes
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          {hasCount
            ? "Limite de ocupação não informado para este grupo."
            : "Aguardando a leitura dos participantes pelo WhatsApp."}
        </p>
      )}
      {group.participantsUpdatedAt && (
        <p className="text-muted-foreground text-[10px]">
          Contagem atualizada em{" "}
          {formatDate(group.participantsUpdatedAt, "dd/MM HH:mm")}
        </p>
      )}
    </div>
  );
}
