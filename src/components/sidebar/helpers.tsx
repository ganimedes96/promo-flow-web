import { Permission } from "@/domains/auth/enums";
import { hasPermission } from "@/utils/permissions";
import {
  LayoutDashboard,
  Users,
  Tags,
  Puzzle,
  CreditCard,
  Smartphone,
  Radio,
} from "lucide-react";

export const identifierLinks: { [key: string]: string } = {
  "/control-panel": "Painel de controle",
  "/connections": "Conexões",
  "/groups": "Grupos",
  "/offers": "Ofertas",
  "/promotions": "Central de promoções",
  "/promotion-sources": "Fontes de promoções",
  "/promotions/manage": "Gerenciar promoções",
  "/subscription": "Assinatura",
  "/extension": "Extensão",
  "/users": "Usuários",
  "/users/create": "Adicionar usuário",
  "/users/[id]/update": "Editar usuário",
};

export interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  requiredPermissions: Permission[];
}

export const navItems: NavItem[] = [
  {
    title: "Fontes de promoções",
    icon: <Radio />,
    href: "/promotion-sources",
    requiredPermissions: [Permission.managePromotions],
  },
  {
    title: "Grupos",
    icon: <Users />,
    href: "/groups",
    requiredPermissions: [],
  },
  {
    title: "Conexões",
    icon: <Smartphone />,
    href: "/connections",
    requiredPermissions: [],
  },
  {
    title: "Central de promoções",
    icon: <Tags />,
    href: "/promotions",
    requiredPermissions: [],
  },
  {
    title: "Gerenciar promoções",
    icon: <Tags />,
    href: "/promotions/manage",
    requiredPermissions: [Permission.managePromotions],
  },
  {
    title: "Assinatura",
    icon: <CreditCard />,
    href: "/subscription",
    requiredPermissions: [],
  },
  {
    title: "Extensão",
    icon: <Puzzle />,
    href: "/extension",
    requiredPermissions: [],
  },
  {
    title: "Ofertas",
    icon: <Tags />,
    href: "/offers",
    requiredPermissions: [],
  },
  {
    title: "Painel de controle",
    icon: <LayoutDashboard />,
    href: "/control-panel",
    requiredPermissions: [],
  },
  {
    title: "Usuários",
    icon: <Users />,
    href: "/users",
    requiredPermissions: [Permission.viewUsers],
  },
];

export function getAccessibleNavItems(userPermissions: Permission[]) {
  if (userPermissions.includes(Permission.all)) return navItems;

  return navItems.filter(
    (item) =>
      item.requiredPermissions.length === 0 ||
      item.requiredPermissions.some((perm) =>
        hasPermission(userPermissions, perm)
      )
  );
}
