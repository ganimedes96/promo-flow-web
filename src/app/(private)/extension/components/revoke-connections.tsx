"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { revokeExtensions } from "@/domains/extension/actions";
import { useServerAction } from "@/hooks/use-server-action";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export function RevokeExtensionConnections() {
  const [open, setOpen] = useState(false);
  const action = useServerAction<null, void>({
    mutationFn: revokeExtensions,
    onSuccess: () => setOpen(false),
  });
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <p className="text-sm font-medium">Conexões da extensão</p>
      <p className="text-muted-foreground text-sm">
        Conecte pelo botão da extensão usando seu login do site. Você pode
        encerrar o acesso em todos os navegadores aqui.
      </p>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            Revogar conexões da extensão
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar todas as extensões?</AlertDialogTitle>
            <AlertDialogDescription>
              Será necessário autorizar novamente em cada navegador. Sua sessão
              no site e seu WhatsApp continuam conectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {action.error && (
            <p role="alert" className="text-destructive text-sm">
              {action.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={action.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={action.isPending}
              onClick={(event) => {
                event.preventDefault();
                action.mutate();
              }}
            >
              Revogar acessos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
