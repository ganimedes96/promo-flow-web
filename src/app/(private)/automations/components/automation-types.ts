import type { Automation } from "@/domains/automations/types";

export const stores = [
  { id: "MERCADO_LIVRE", name: "Mercado Livre" },
  { id: "SHOPEE", name: "Shopee" },
  { id: "AMAZON", name: "Amazon" },
];
export const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
].map((name, id) => ({ id, name }));

type DayRule = NonNullable<Automation["dayRules"]>[number];

export type ScheduleFormValues = Omit<Automation, "dayRules"> & {
  dayRules: (Omit<DayRule, "intervalMinutes"> & { intervalMinutes: string })[];
  dayOptions: string[];
  whatsappGroups: string[];
  telegramGroups: string[];
};

export type AutomationGroup = {
  id: string;
  name: string;
  platform: "whatsapp" | "telegram";
  canPublish: boolean;
};
