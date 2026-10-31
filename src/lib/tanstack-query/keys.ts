type Params = object;

const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: Params) => [...usersKeys.lists(), params ?? {}] as const,
};

export const queryKeys = {
  promotions: {
    all: ["promotions"] as const,
    list: (page: number, manage: boolean, userId?: string) =>
      ["promotions", page, manage, userId] as const,
  },
  billing: {
    access: (userId?: string) => ["billing", "access", userId] as const,
    plans: ["billing", "plans"] as const,
  },
  users: usersKeys,
  offers: {
    all: ["offers"] as const,
    duplicates: (sourceUrl: string) =>
      ["offers", "duplicates", sourceUrl] as const,
    list: (params?: Params) => ["offers", "list", params ?? {}] as const,
    grouped: (params?: Params) => ["offers", "grouped", params ?? {}] as const,
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
