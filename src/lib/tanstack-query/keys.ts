type Params = object;

const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: Params) => [...usersKeys.lists(), params ?? {}] as const,
};

export const queryKeys = {
  users: usersKeys,
  offers: {
    all: ["offers"] as const,
    list: (params?: Params) => ["offers", "list", params ?? {}] as const,
  },
  whatsapp: {
    session: ["whatsapp", "session"] as const,
    groups: ["whatsapp", "groups"] as const,
  },
};
