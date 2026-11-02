"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface ButtonLogoutProps {
  showDialog?: boolean;
  asMenuItem?: boolean;
}

export function ButtonLogout({
  showDialog = true,
  asMenuItem = false,
}: ButtonLogoutProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Não foi possível sair. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  if (!showDialog) {
    return (
      <div>
        <Button
          type="button"
          variant="secondary"
          className="flex w-full items-center justify-center"
          onClick={logout}
          disabled={pending}
        >
          {pending ? "Saindo…" : "Sair"}
        </Button>
        {error && (
          <p role="alert" className="text-destructive mt-2 text-sm">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (pending) return;
        setError(null);
        setOpen(value);
      }}
    >
      <AlertDialogTrigger asChild>
        {asMenuItem ? (
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
            Sair
          </DropdownMenuItem>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="flex w-full items-center justify-center"
          >
            Sair
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Sua sessão será encerrada somente ao confirmar. Você poderá entrar
            novamente quando quiser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button type="button" onClick={logout} disabled={pending}>
            {pending ? "Saindo…" : "Confirmar saída"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
