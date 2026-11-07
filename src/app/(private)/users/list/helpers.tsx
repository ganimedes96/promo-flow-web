import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@/components/ui/data-table";
import { Role } from "@/domains/auth/enums";
import { User } from "@/domains/users/types";

const roleLabels: Record<Role, string> = {
  [Role.admin]: "Administrador",
  [Role.member]: "Membro",
};

export const columns: ColumnDef<User>[] = [
  { key: "name", header: "Nome", primary: true },
  { key: "email", header: "E-mail" },
  { key: "phone", header: "Telefone" },
  {
    key: "role",
    header: "Perfil",
    isStatus: true,
    render: (role) => (
      <Badge variant="secondary">{roleLabels[role as Role]}</Badge>
    ),
  },
];
