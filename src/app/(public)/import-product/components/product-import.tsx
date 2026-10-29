"use client";
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
import {
  EXTENSION_DRAFT_KEY,
  extensionImportSchema,
  ExtensionImport,
} from "@/domains/offers/extension-import";
export function ProductImport({ authenticated }: { authenticated: boolean }) {
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
      if (age < -300000 || age > 60 * 60 * 1000)
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
  return (
    <main className="bg-background min-h-svh px-4 py-8 sm:px-8">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Revisar produto importado</CardTitle>
          <CardDescription>
            Confira os dados do Mercado Livre. A oferta só será cadastrada
            quando você clicar em salvar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !draft ? (
            <p>Carregando rascunho…</p>
          ) : !authenticated ? (
            <div className="space-y-4">
              <p className="font-medium">
                {draft.draft.title || "Produto do Mercado Livre"}
              </p>
              <p className="text-muted-foreground text-sm">
                Faça login para escolher o grupo e concluir o cadastro. O
                rascunho ficará guardado nesta aba por até uma hora.
              </p>
              <Button asChild>
                <Link href="/login?import=product">Entrar e continuar</Link>
              </Button>
            </div>
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
              <CreateOfferForm
                initialDraft={draft.draft}
                onSuccess={() => {
                  sessionStorage.removeItem(EXTENSION_DRAFT_KEY);
                  router.replace("/offers");
                }}
              />
            </>
          )}
          <Link
            href={authenticated ? "/offers" : "/login"}
            className="text-muted-foreground text-sm underline"
          >
            {authenticated ? "Voltar para ofertas" : "Ir para o login"}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
