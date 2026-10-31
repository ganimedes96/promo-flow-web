"use client";
import { SkeletonRegion } from "@/components/feedback/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDuplicateOffers } from "@/domains/offers/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { UpdateOfferForm } from "@/app/(private)/offers/components/form/update";
export function DuplicateOffersNotice({ sourceUrl }: { sourceUrl: string }) {
  const duplicates = useQuery({
    queryKey: queryKeys.offers.duplicates(sourceUrl),
    queryFn: () => getDuplicateOffers(sourceUrl),
    staleTime: 30000,
  });
  if (duplicates.isPending)
    return (
      <SkeletonRegion label="Conferindo cadastros anteriores">
        <Skeleton className="h-12 rounded-xl" />
      </SkeletonRegion>
    );
  if (duplicates.error)
    return (
      <Alert>
        <AlertDescription>
          Não foi possível conferir os cadastros anteriores. Isso não impede a
          revisão da oferta.{" "}
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => void duplicates.refetch()}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  if (!duplicates.data?.length) return null;
  return (
    <Alert>
      <AlertDescription className="w-full space-y-3">
        <p className="font-semibold">
          Este produto já possui cadastro na sua conta.
        </p>
        <p>
          Você pode abrir um cadastro existente para revisar os dados. O
          cadastro repetido no mesmo grupo é bloqueado. Para divulgar em outro
          grupo, selecione um destino diferente no formulário abaixo.
        </p>
        {duplicates.data.map((offer) => (
          <div
            key={offer.id}
            className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {offer.title || "Oferta sem título"}
              </p>
              <p className="text-muted-foreground text-xs">
                Grupo: {offer.whatsappGroup?.name || "Sem grupo"}
              </p>
            </div>
            {["READY", "FAILED", "CANCELLED", "PUBLISHED"].includes(
              offer.status
            ) ? (
              <FormSheet
                title="Revisar cadastro existente"
                description="Salvar altera este cadastro. O rascunho capturado permanece no formulário anterior."
                buttonText="Abrir cadastro"
                buttonVariant="outline"
                formComponent={UpdateOfferForm}
                formProps={{ offer }}
                className="w-full gap-6 overflow-y-auto px-4 pb-4 sm:max-w-4xl"
              />
            ) : (
              <Button asChild variant="outline">
                <Link href="/offers">Ver oferta na listagem</Link>
              </Button>
            )}
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
