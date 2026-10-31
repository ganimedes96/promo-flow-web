"use client";
import { OfferFormSkeleton } from "@/components/feedback/loading-skeletons";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateOfferForm } from "@/app/(private)/offers/components/form/create";
import { PromotionForm } from "@/app/(private)/promotions/components/form";
import {
  EXTENSION_DRAFT_KEY,
  extensionImportSchema,
  ExtensionImport,
} from "@/domains/offers/extension-import";
import { DuplicateOffersNotice } from "./duplicate-offers-notice";
export function ProductImport({
  authenticated,
  isAdmin = false,
  currentUserId,
}: {
  authenticated: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExtensionImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try {
      const fragment = window.location.hash;
      const incoming = fragment.startsWith("#promoflow=");
      const raw = incoming
        ? decodeURIComponent(fragment.slice("#promoflow=".length))
        : sessionStorage.getItem(EXTENSION_DRAFT_KEY);
      if (!raw || raw.length > 40000 || fragment.length > 60020)
        throw new Error(
          "Nenhum rascunho válido encontrado. Capture o produto novamente pela extensão."
        );
      const parsed = extensionImportSchema.parse(JSON.parse(raw));
      const age = Date.now() - new Date(parsed.capturedAt).getTime();
      if (age < -300000 || age > 3600000)
        throw new Error(
          "Este rascunho expirou. Capture novamente para conferir o preço atual."
        );
      sessionStorage.setItem(EXTENSION_DRAFT_KEY, JSON.stringify(parsed));
      if (incoming)
        window.history.replaceState(null, "", window.location.pathname);
      setDraft(parsed);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error && !cause.name.includes("Zod")
          ? cause.message
          : "Dados da extensão inválidos. Capture o produto novamente."
      );
    }
  }, []);
  const central = draft?.target === "central";
  const back = central && isAdmin ? "/promotions/manage" : "/offers";
  function saved() {
    sessionStorage.removeItem(EXTENSION_DRAFT_KEY);
    router.replace(back);
  }
  return (
    <main className="bg-background min-h-svh px-4 py-8 sm:px-8">
      <Card className="mx-auto w-full max-w-5xl">
        <CardHeader>
          <CardTitle>
            {central
              ? "Revisar promoção para a central"
              : "Revisar produto importado"}
          </CardTitle>
          <CardDescription>
            Confira os dados da loja. O cadastro só acontece quando você clicar
            em salvar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !draft ? (
            <OfferFormSkeleton />
          ) : !authenticated ? (
            <div className="space-y-4">
              <p className="font-medium">
                {draft.draft.title || "Produto importado"}
              </p>
              <p className="text-muted-foreground text-sm">
                Faça login com a mesma conta da extensão para concluir. O
                rascunho ficará guardado nesta aba por até uma hora.
              </p>
              <Button asChild>
                <Link href="/login?import=product">Entrar e continuar</Link>
              </Button>
            </div>
          ) : draft.accountId && draft.accountId !== currentUserId ? (
            <Alert variant="destructive">
              <AlertDescription>
                A extensão está conectada a outra conta. Entre no site com a
                mesma conta da extensão ou reconecte a extensão com o usuário
                correto e capture novamente.
              </AlertDescription>
            </Alert>
          ) : central && !isAdmin ? (
            <Alert variant="destructive">
              <AlertDescription>
                Somente administradores podem cadastrar na central. Conecte a
                extensão com a conta correta.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertDescription>
                  {[
                    ...draft.warnings,
                    "Revise preço, variação e condições de pagamento antes de salvar.",
                  ].join(" ")}
                </AlertDescription>
              </Alert>
              {central ? (
                <PromotionForm initialDraft={draft.draft} onSuccess={saved} />
              ) : (
                <>
                  <DuplicateOffersNotice sourceUrl={draft.draft.sourceUrl} />
                  <CreateOfferForm
                    initialDraft={draft.draft}
                    onSuccess={saved}
                  />
                </>
              )}
            </>
          )}
          <Link
            href={authenticated ? back : "/login"}
            className="text-muted-foreground text-sm underline"
          >
            {authenticated
              ? central && isAdmin
                ? "Voltar para a central"
                : "Voltar para ofertas"
              : "Ir para o login"}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
