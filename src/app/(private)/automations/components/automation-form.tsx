import { useForm, useWatch } from "react-hook-form";
import { saveAutomation } from "@/domains/automations/actions";
import { automationSchema, type Automation } from "@/domains/automations/types";
import { useServerAction } from "@/hooks/use-server-action";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/tanstack-query/keys";
import type { AutomationGroup, ScheduleFormValues } from "./automation-types";
import { toScheduleFormValues } from "./automation-form-helpers";
import { PublicationMode } from "./publication-mode";
import { DestinationSettings } from "./destination-settings";
import { OfferFiltersSettings } from "./offer-filters-settings";
import { ScheduleSettings } from "./schedule-settings";
import { SavedAutomationSummary } from "./saved-automation-summary";

export function AutomationForm({
  initial,
  groups,
  categories,
  userId,
  planLimit,
}: {
  initial: Automation;
  groups: AutomationGroup[];
  categories: { id: string; name: string }[];
  userId?: string;
  planLimit?: number;
}) {
  const whatsapp = groups.filter((group) => group.platform === "whatsapp");
  const telegram = groups.filter((group) => group.platform === "telegram");
  const form = useForm<ScheduleFormValues>({
    defaultValues: toScheduleFormValues(initial, groups),
  });
  const [enabled, whatsappSelection, telegramSelection] = useWatch({
    control: form.control,
    name: ["enabled", "whatsappGroups", "telegramGroups"],
  });
  const { isDirty, errors } = form.formState;
  const save = useServerAction({
    mutationFn: saveAutomation,
    invalidateQueries: [queryKeys.automations.settings(userId)],
    successMessage: "Automação salva.",
    onSuccess: ({ data }) => {
      form.reset(toScheduleFormValues(data, groups));
    },
  });
  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(
        ({ dayOptions, whatsappGroups, telegramGroups, ...values }) => {
          const groupIds = [...whatsappGroups, ...telegramGroups];
          if (values.enabled) {
            const message = !values.marketplaces.length
              ? "Selecione pelo menos uma loja em Filtros de ofertas."
              : !groupIds.length
                ? "Selecione pelo menos um grupo favorito em Destinos."
                : groupIds.some(
                      (id) =>
                        !groups.some(
                          (group) => group.id === id && group.canPublish
                        )
                    )
                  ? "Conecte ou retome os envios das conexões dos destinos selecionados."
                  : null;
            if (message) {
              form.setError("root", { message });
              toast.error(message);
              return;
            }
          }
          const parsed = automationSchema.safeParse({
            ...values,
            groupIds,
            days: dayOptions.map(Number),
            dailyLimit: Number(values.dailyLimit),
            intervalMinutes: Number(values.intervalMinutes),
          });
          if (!parsed.success) {
            const message = "Confira os destinos, dias, horários e limites.";
            form.setError("root", { message });
            toast.error(message);
            return;
          }
          form.clearErrors("root");
          save.mutate(parsed.data);
        }
      )}
    >
      <PublicationMode control={form.control} enabled={enabled} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <DestinationSettings
          control={form.control}
          whatsapp={whatsapp}
          telegram={telegram}
          whatsappSelection={whatsappSelection}
          telegramSelection={telegramSelection}
        />
        <OfferFiltersSettings control={form.control} categories={categories} />
      </div>
      <ScheduleSettings
        control={form.control}
        planLimit={planLimit}
        initialInterval={initial.intervalMinutes}
      />
      <SavedAutomationSummary
        initial={initial}
        groups={groups}
        isDirty={isDirty}
        error={errors.root?.message}
        pending={save.isPending}
      />
    </form>
  );
}
