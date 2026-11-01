"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Offer } from "@/domains/offers/types";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { assignMirrorDestinations } from "@/domains/mirroring/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/shadcn/utils";
export function MirrorDestinations({
  offer,
  onDone,
}: {
  offer: Offer;
  onDone: () => void;
}) {
  const { data: session } = useSession();
  const groups = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), session?.user.id],
    queryFn: () => getWhatsAppGroups(),
    enabled: !!session?.user.id,
    retry: false,
  });
  const form = useForm<{ groupIds: string[] }>({
    defaultValues: { groupIds: [] },
  });
  const ids = useWatch({ control: form.control, name: "groupIds" });
  const favorites = (groups.data ?? []).filter((group) => group.isFavorite);
  const selected = favorites.filter((group) => ids.includes(group.id));
  const accounts = new Set(selected.map((group) => group.connectionId)).size;
  const applied = offer.mirrorAffiliateStatus === "APPLIED";
  const assign = useServerAction({
    mutationFn: assignMirrorDestinations,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Destinos vinculados! Sua oferta continua sem agendamento.",
    onSuccess: onDone,
  });
  return (
    <form
      className="bg-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 space-y-5 rounded-2xl border p-5 shadow-sm motion-safe:duration-300"
      onSubmit={form.handleSubmit((data) => {
        if (
          !data.groupIds.length ||
          data.groupIds.length > 20 ||
          data.groupIds.some(
            (id) => !favorites.some((group) => group.id === id)
          )
        ) {
          form.setError("groupIds", {
            message: "Selecione de 1 a 20 grupos favoritos disponíveis.",
          });
          return;
        }
        assign.mutate({ id: offer.id, groupIds: data.groupIds });
      })}
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary rounded-xl p-2.5">
          <Users className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold">Onde essa oferta vai chegar?</h3>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Escolha até 20 grupos favoritos, inclusive de contas diferentes.
            Você decide quando enviar.
          </p>
        </div>
      </div>
      {groups.isPending ? (
        <div aria-label="Carregando grupos" className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : groups.isError ? (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 rounded-xl border p-4 text-sm"
        >
          <p>Não foi possível carregar seus grupos.</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => void groups.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : !favorites.length ? (
        <div className="rounded-xl border border-dashed p-5 text-center">
          <Users className="text-muted-foreground mx-auto mb-2 size-7" />
          <p className="text-sm font-medium">
            Seus destinos começam nos favoritos
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Favorite os grupos que você quer usar para suas ofertas.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            asChild
          >
            <Link href="/groups">Escolher favoritos</Link>
          </Button>
        </div>
      ) : (
        <fieldset
          disabled={!applied || assign.isPending}
          className="min-w-0 space-y-2 disabled:opacity-60"
        >
          <ControlledMultiSelect
            control={form.control}
            name="groupIds"
            label="Grupos favoritos de destino"
            placeholder="Busque e selecione seus grupos"
            options={favorites.map((group) => ({
              id: group.id,
              name: group.name + " · +" + group.accountPhone,
            }))}
            searchable
            maxSelected={20}
            maxCount={2}
          />
          <p className="text-muted-foreground text-[11px]">
            {applied
              ? "Selecione vários grupos na mesma lista."
              : "Aplique seu link de afiliado para liberar a seleção."}
          </p>
        </fieldset>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={cn(
            "rounded-xl border p-3 transition-colors",
            selected.length ? "border-primary/25 bg-primary/5" : "bg-muted/30"
          )}
        >
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Users className="size-3.5" />
            Destinos
          </div>
          <p
            key={selected.length}
            className="motion-safe:animate-in motion-safe:fade-in mt-1 text-2xl font-semibold tabular-nums motion-safe:duration-200"
          >
            {selected.length}
            <span className="text-muted-foreground ml-1 text-xs font-normal">
              / 20
            </span>
          </p>
        </div>
        <div className="bg-muted/30 rounded-xl border p-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Smartphone className="size-3.5" />
            Contas do WhatsApp
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{accounts}</p>
        </div>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {selected.slice(0, 5).map((group) => (
            <Badge
              key={group.id}
              variant="secondary"
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 max-w-full gap-1.5 px-2.5 py-1"
            >
              <Check className="size-3 shrink-0" />
              <span className="max-w-48 truncate">{group.name}</span>
            </Badge>
          ))}
          {selected.length > 5 && (
            <Badge variant="outline">+{selected.length - 5} grupos</Badge>
          )}
        </div>
      )}
      <div className="bg-primary/5 text-muted-foreground flex items-start gap-2 rounded-xl p-3 text-xs">
        <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
        <p>
          A oferta continuará em uma única linha, com um destino para cada
          grupo. Nenhum envio será agendado agora.
        </p>
      </div>
      {assign.error && (
        <p role="alert" className="text-destructive text-sm">
          {assign.error.message}
        </p>
      )}
      <Button
        type="submit"
        className="w-full gap-2"
        loading={assign.isPending}
        disabled={
          !applied ||
          assign.isPending ||
          groups.isPending ||
          groups.isError ||
          !ids.length ||
          ids.length !== selected.length
        }
      >
        Vincular {selected.length || ""}{" "}
        {selected.length === 1 ? "grupo" : "grupos"}
        <ArrowRight className="size-4 motion-safe:animate-pulse" />
      </Button>
      <p className="text-muted-foreground text-center text-[11px]">
        Depois, revise os dados e agende pela tabela.
      </p>
    </form>
  );
}
