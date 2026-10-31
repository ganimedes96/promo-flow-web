import { Permission } from "@/domains/auth/enums";

export const routePermissionsMap = {
  "/promotion-sources": {
    view: Permission.managePromotions,
    create: Permission.managePromotions,
    update: Permission.managePromotions,
    delete: Permission.managePromotions,
  },
  "/users": {
    view: Permission.viewUsers,
    create: Permission.createUser,
    update: Permission.updateUser,
    delete: Permission.deleteUser,
  },
  "/events": {
    view: Permission.viewEvents,
    create: Permission.createEvents,
    update: Permission.updateEvents,
    delete: Permission.deleteEvents,
  },
};

export function getRoutePermission(pathname: string): Permission[] | null {
  for (const [basePath, permissions] of Object.entries(routePermissionsMap)) {
    if (pathname === basePath) return [permissions.view];
    if (pathname === `${basePath}/create`) return [permissions.create];
    if (pathname.endsWith("/update") && pathname.startsWith(`${basePath}/`)) {
      return [permissions.update];
    }
    if (pathname.startsWith(`${basePath}/`)) return [permissions.view];
  }

  return null;
}

export function hasPermission(
  userPermissions: Permission[] = [],
  permission: Permission
): boolean {
  return (
    userPermissions.includes(Permission.all) ||
    userPermissions.includes(permission)
  );
}

export const permissionsModules = [
  {
    name: "users",
    label: "Usuários",
    permissions: [
      { value: Permission.viewUsers, label: "Visualizar" },
      { value: Permission.createUser, label: "Criar" },
      { value: Permission.updateUser, label: "Editar" },
      { value: Permission.deleteUser, label: "Excluir" },
    ],
  },
  {
    name: "events",
    label: "Eventos",
    permissions: [
      { value: Permission.viewEvents, label: "Visualizar" },
      { value: Permission.createEvents, label: "Criar" },
      { value: Permission.updateEvents, label: "Editar" },
      { value: Permission.deleteEvents, label: "Excluir" },
    ],
  },
];

export function getPermissionModules(userPermissions: Permission[]) {
  if (userPermissions.includes(Permission.all)) return permissionsModules;

  return permissionsModules
    .map((module) => ({
      ...module,
      permissions: module.permissions.filter((permission) =>
        userPermissions.includes(permission.value)
      ),
    }))
    .filter((module) => module.permissions.length > 0);
}
