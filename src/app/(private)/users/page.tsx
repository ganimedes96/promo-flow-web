import { CanServer } from "@/components/can/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Permission } from "@/domains/auth/enums";
import { ShieldAlert } from "lucide-react";
import { UsersTable } from "./list/table";

export default function UsersPage() {
  return (
    <CanServer
      permission={Permission.all}
      fallback={
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Acesso negado</AlertTitle>
          <AlertDescription>
            Seu perfil não possui permissão para gerenciar usuários.
          </AlertDescription>
        </Alert>
      }
    >
      <UsersTable />
    </CanServer>
  );
}
