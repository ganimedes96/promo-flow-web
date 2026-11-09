import type { Control } from "react-hook-form";
import Link from "next/link";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AutomationGroup, ScheduleFormValues } from "./automation-types";

export function DestinationSettings({
  control,
  whatsapp,
  telegram,
  whatsappSelection,
  telegramSelection,
}: {
  control: Control<ScheduleFormValues>;
  whatsapp: AutomationGroup[];
  telegram: AutomationGroup[];
  whatsappSelection: string[];
  telegramSelection: string[];
}) {
  const selectedCount = whatsappSelection.length + telegramSelection.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Destinos</CardTitle>
        <CardDescription>
          Para grupos de origem do WhatsApp, configure os destinos em Espelhamento. Use esta lista como destino geral para as demais origens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="whatsapp" className="w-full min-w-0 flex-col">
          <TabsList
            className="grid h-auto w-full shrink-0 grid-cols-2 gap-1 rounded-xl p-1"
            aria-label="Serviço de destino"
          >
            {(
              [
                {
                  platform: "whatsapp",
                  label: "WhatsApp",
                  count: whatsappSelection.length,
                },
                {
                  platform: "telegram",
                  label: "Telegram",
                  count: telegramSelection.length,
                },
              ] as const
            ).map(({ platform, label, count }) => (
              <TabsTrigger
                key={platform}
                value={platform}
                className="group/channel data-[state=active]:border-primary/60 data-[state=active]:bg-primary/15 data-[state=active]:text-foreground h-auto min-w-0 flex-wrap gap-1.5 rounded-lg px-2 py-2 motion-reduce:transition-none"
              >
                <span className="opacity-75 group-data-[state=active]/channel:opacity-100 motion-safe:transition-[transform,opacity] motion-safe:group-data-[state=active]/channel:scale-110">
                  <AnimatedChannelIcon platform={platform} compact />
                </span>
                <span>{label}</span>
                <span className="bg-background/70 group-data-[state=active]/channel:bg-primary/20 rounded-full px-1.5 py-0.5 text-xs tabular-nums">
                  {count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {(
            [
              {
                platform: "whatsapp",
                label: "WhatsApp",
                field: "whatsappGroups",
                options: whatsapp,
              },
              {
                platform: "telegram",
                label: "Telegram",
                field: "telegramGroups",
                options: telegram,
              },
            ] as const
          ).map(({ platform, label, field, options }) => (
            <TabsContent
              key={platform}
              value={platform}
              className="bg-muted/20 motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in motion-safe:data-[state=active]:slide-in-from-bottom-1 mt-2 min-h-24 w-full min-w-0 rounded-xl border p-4 motion-safe:duration-200"
            >
              {options.length ? (
                <ControlledMultiSelect
                  control={control}
                  name={field}
                  label={`Destinos favoritos no ${label}`}
                  options={options}
                  maxSelected={20}
                  searchable
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Marque um destino do {label} como favorito em{" "}
                  <Link href="/groups" className="underline">
                    Grupos
                  </Link>
                  .
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-muted-foreground text-xs">
          {selectedCount} de 20 destinos selecionados nas duas abas.
        </p>
      </CardContent>
    </Card>
  );
}
