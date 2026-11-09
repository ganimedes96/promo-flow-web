import type { Automation } from "@/domains/automations/types";
import type { AutomationGroup, ScheduleFormValues } from "./automation-types";

export function toScheduleFormValues(
  settings: Automation,
  groups: AutomationGroup[]
): ScheduleFormValues {
  return {
    ...settings,
    dayRules: Array.from({ length: 7 }, (_, day) => {
      const rule = settings.dayRules?.[day] ?? settings;
      return {
        start: rule.start,
        end: rule.end,
        dailyLimit: rule.dailyLimit,
        intervalMinutes: String(rule.intervalMinutes),
      };
    }),
    dayOptions: settings.days.map(String),
    whatsappGroups: settings.groupIds.filter((id) =>
      groups.some((group) => group.id === id && group.platform === "whatsapp")
    ),
    telegramGroups: settings.groupIds.filter((id) =>
      groups.some((group) => group.id === id && group.platform === "telegram")
    ),
  };
}
