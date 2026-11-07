import type { Automation } from "@/domains/automations/types";
import type { AutomationGroup, ScheduleFormValues } from "./automation-types";

export function toScheduleFormValues(
  settings: Automation,
  groups: AutomationGroup[]
): ScheduleFormValues {
  return {
    ...settings,
    intervalMinutes: String(settings.intervalMinutes),
    dayOptions: settings.days.map(String),
    whatsappGroups: settings.groupIds.filter((id) =>
      groups.some((group) => group.id === id && group.platform === "whatsapp")
    ),
    telegramGroups: settings.groupIds.filter((id) =>
      groups.some((group) => group.id === id && group.platform === "telegram")
    ),
  };
}
