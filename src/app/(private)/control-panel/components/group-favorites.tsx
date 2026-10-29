"use client";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppGroup } from "@/domains/whatsapp/types";
import { setFavoriteGroup } from "@/domains/whatsapp/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function GroupFavorites({ groups }: { groups: WhatsAppGroup[] }) {
  const favorite = useServerAction({
    mutationFn: setFavoriteGroup,
    invalidateQueries: [queryKeys.whatsapp.groups],
    disableSuccessToast: true,
  });
  const sortedGroups = [...groups].sort(
    (a, b) => Number(b.isFavorite) - Number(a.isFavorite)
  );
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-medium">Grupos favoritos</h3>
        <p className="text-muted-foreground text-sm">
          Marque com a estrela os grupos que devem aparecer no cadastro de
          ofertas.
        </p>
      </div>
      <ul className="max-h-80 space-y-2 overflow-y-auto pr-2">
        {sortedGroups.map((group) => (
          <li
            key={group.id}
            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm break-words">{group.name}</p>
              {group.isDefault && <Badge variant="secondary">Padrão</Badge>}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                (group.isFavorite ? "Remover dos favoritos: " : "Favoritar: ") +
                group.name
              }
              aria-pressed={group.isFavorite}
              title={
                group.isFavorite ? "Remover dos favoritos" : "Favoritar grupo"
              }
              disabled={favorite.isPending}
              onClick={() =>
                favorite.mutate({
                  groupId: group.id,
                  isFavorite: !group.isFavorite,
                })
              }
            >
              <Star
                className={
                  group.isFavorite
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }
              />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
