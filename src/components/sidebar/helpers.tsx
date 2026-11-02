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
  Store,
  Activity,
  MessageCircle,
} from "lucide-react";

export const identifierLinks: { [key: string]: string } = {
  "/mirroring": "Espelhar grupos",
  "/control-panel": "Painel de controle",
  "/connections": "Conexões",
  "/groups": "Grupos",
  "/offers": "Ofertas",
  "/promotions": "Central de promoções",
  "/promotion-sources": "Fontes de promoções",
  "/promotions/manage": "Gerenciar promoções",
  "/subscription": "Assinatura",
  "/extension": "Extensão",
  "/stores": "Lojas",
  "/operations": "Operação",
  "/message-settings": "Minhas mensagens",
  "/clients": "Clientes",
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
  {title:"Clientes",icon:<Users />,href:"/clients",requiredPermissions:[Permission.managePromotions]},
  {
    title: "Espelhar grupos",
    icon: <Radio />,
    href: "/mirroring",
    requiredPermissions: [],
  },
  {
    title: "Minhas mensagens",
    icon: <MessageCircle />,
    href: "/message-settings",
    requiredPermissions: [],
  },
  {
    title: "Operação",
    icon: <Activity />,
    href: "/operations",
    requiredPermissions: [Permission.managePromotions],
  },
  { title: "Lojas", icon: <Store />, href: "/stores", requiredPermissions: [] },
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

export interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}
const navSections = [
  {
    id: "offers",
    title: "Ofertas",
    icon: <Tags />,
    hrefs: ["/offers", "/promotions", "/mirroring"],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    icon: <Smartphone />,
    hrefs: ["/connections", "/groups", "/message-settings"],
  },
  {
    id: "settings",
    title: "Configurações",
    icon: <Store />,
    hrefs: ["/stores", "/extension", "/subscription"],
  },
  {
    id: "admin",
    title: "Administração",
    icon: <Activity />,
    hrefs: [
      "/promotions/manage",
      "/promotion-sources",
      "/operations",
      "/clients",
      "/users",
    ],
  },
];
export function getAccessibleNavSections(
  userPermissions: Permission[]
): NavSection[] {
  const accessible = new Map(
    getAccessibleNavItems(userPermissions).map((item) => [item.href, item])
  );
  return navSections
    .map((section) => ({
      id: section.id,
      title: section.title,
      icon: section.icon,
      items: section.hrefs.flatMap((href) => {
        const item = accessible.get(href);
        return item ? [item] : [];
      }),
    }))
    .filter((section) => section.items.length > 0);
}
