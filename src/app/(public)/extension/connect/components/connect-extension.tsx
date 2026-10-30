"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle, ShieldCheck, ArrowRight } from "lucide-react";
import { z } from "zod";
import { authorizeExtension } from "@/domains/extension/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
const key = "promoflow:extension-authorization";
const requestSchema = z.object({
  redirectUri: z
    .string()
    .regex(/^https:\/\/[a-p]{32}\.chromiumapp\.org\/promoflow$/),
  challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  state: z.string().regex(/^[a-f0-9]{64}$/),
  createdAt: z.number(),
});
type Request = z.infer<typeof requestSchema>;
export function ConnectExtension({
  account,
}: {
  account: { name: string; email: string } | null;
}) {
  const [request, setRequest] = useState<Request | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming = params.has("challenge");
      const candidate = incoming
        ? {
            challenge: params.get("challenge"),
            redirectUri: params.get("redirectUri"),
            state: params.get("state"),
            createdAt: Date.now(),
          }
        : JSON.parse(sessionStorage.getItem(key) || "null");
      const parsed = requestSchema.parse(candidate);
      if (
        Date.now() - parsed.createdAt > 10 * 60000 ||
        parsed.createdAt > Date.now() + 60000
      )
        throw new Error();
      sessionStorage.setItem(key, JSON.stringify(parsed));
      if (incoming)
        window.history.replaceState(null, "", window.location.pathname);
      setRequest(parsed);
    } catch {
      setError(
        "Solicitação inválida ou expirada. Abra a extensão e clique em Conectar ao PromoFlow novamente."
      );
    }
  }, []);
  async function connect() {
    if (!request) return;
    setBusy(true);
    setError("");
    try {
      const result = await authorizeExtension({
        challenge: request.challenge,
        redirectUri: request.redirectUri,
      });
      if (!("data" in result)) throw new Error(result.message);
      const callback = new URL(request.redirectUri);
      callback.hash = new URLSearchParams({
        code: result.data.code,
        state: request.state,
      }).toString();
      sessionStorage.removeItem(key);
      window.location.assign(callback.toString());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível conectar."
      );
      setBusy(false);
    }
  }
  function cancel() {
    if (!request) return;
    const callback = new URL(request.redirectUri);
    callback.hash = new URLSearchParams({
      error: "access_denied",
      state: request.state,
    }).toString();
    sessionStorage.removeItem(key);
    window.location.assign(callback.toString());
  }
  return (
    <main className="app-surface-bg flex min-h-svh items-center justify-center p-5">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-2xl">
            <Puzzle className="size-6" />
          </div>
          <CardTitle>Conectar extensão ao PromoFlow</CardTitle>
          <CardDescription>
            Autorize a extensão que você acabou de abrir no Chrome.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {account && (
            <div className="bg-muted/50 rounded-xl border p-4">
              <p className="font-medium">{account.name}</p>
              <p className="text-muted-foreground text-sm break-all">
                {account.email}
              </p>
            </div>
          )}
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck className="text-primary size-4" /> Você controla esta
              conexão
            </p>
            <p className="text-muted-foreground">
              A extensão identifica sua conta e abre os produtos capturados para
              revisão. Administradores também podem preparar promoções para a
              central.
            </p>
            <p className="text-muted-foreground">
              Sua senha fica no site. Nenhuma oferta é salva ou publicada
              automaticamente. Você pode revogar o acesso na página Extensão.
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {request && (
            <div className="flex flex-wrap gap-3">
              {account ? (
                <Button onClick={connect} loading={busy} disabled={busy}>
                  Autorizar conexão <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/login?extension=connect">
                    Entrar para continuar
                  </Link>
                </Button>
              )}
              <Button variant="outline" disabled={busy} onClick={cancel}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
