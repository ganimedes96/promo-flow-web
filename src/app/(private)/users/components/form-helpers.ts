import { Role } from "@/domains/auth/enums";

export const roleOptions = [
  { id: Role.admin, name: "Administrador" },
  { id: Role.member, name: "Membro" },
];
