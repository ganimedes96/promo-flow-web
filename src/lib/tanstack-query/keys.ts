type Params = object;

const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: Params) => [...usersKeys.lists(), params ?? {}] as const,
};

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    list: (adminId: string | undefined, filters: object) =>
      ["clients", "list", adminId, filters] as const,
    detail: (adminId: string | undefined, id: string) =>
      ["clients", "detail", adminId, id] as const,
  },
  mirroring: {
    telegram: (userId?: string) => ["mirroring", "telegram", userId] as const,
    all: ["mirroring"] as const,
    sources: (userId?: string) => ["mirroring", userId] as const,
  },
  messageSettings: {
    all: ["message-settings"] as const,
    forUser: (userId?: string) => ["message-settings", userId] as const,
  },
  operations: {
    localControl: (userId?: string) =>
      ["operations", "local-control", userId] as const,
    users: (adminId: string | undefined, search: string) =>
      ["operations", "users", adminId, search] as const,
    support: (adminId: string | undefined, filters: object) =>
      ["operations", "support", adminId, filters] as const,
    status: (userId?: string) => ["operations", "status", userId] as const,
  },
  stores: {
    all: ["stores"] as const,
    list: (userId?: string) => ["stores", userId] as const,
  },
  collection: {
    all: ["collection"] as const,
    whatsapp: (userId?: string) => ["collection", "whatsapp", userId] as const,
  },
  telegram: {
    all: ["telegram"] as const,
    status: (userId?: string) => ["telegram", userId] as const,
  },
  categories: { all: ["categories"] as const },
  promotions: {
    all: ["promotions"] as const,
    list: (
      page: number,
      manage: boolean,
      userId?: string,
      excludeRecent = false
    ) => ["promotions", page, manage, userId, excludeRecent] as const,
  },
  plans: {
    all: ["managed-plans"] as const,
    list: (adminId?: string) => ["managed-plans", adminId] as const,
  },
  billing: {
    all: ["billing"] as const,
    subscription: (userId?: string) =>
      ["billing", "subscription", userId] as const,
    access: (userId?: string) => ["billing", "access", userId] as const,
    plans: ["billing", "plans"] as const,
  },
  users: usersKeys,
  offers: {
    all: ["offers"] as const,
    filterGroups: (userId?: string) =>
      ["offers", "filter-groups", userId] as const,
    duplicates: (sourceUrl: string) =>
      ["offers", "duplicates", sourceUrl] as const,
    list: (params?: Params) => ["offers", "list", params ?? {}] as const,
    grouped: (params?: Params) => ["offers", "grouped", params ?? {}] as const,
  },
  telegramPublisher: {
    all: ["telegram-publisher"] as const,
    status: ["telegram-publisher", "status"] as const,
  },
  whatsapp: {
    connections: ["whatsapp", "connections"] as const,
    sessionFor: (id?: string) =>
      ["whatsapp", "session", id ?? "default"] as const,
    groupsFor: (id?: string) => ["whatsapp", "groups", id ?? "all"] as const,
    session: ["whatsapp", "session"] as const,
    groups: ["whatsapp", "groups"] as const,
  },
};
