"use client";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppMirroring } from "./whatsapp-mirroring";
import { TelegramMirroring } from "./telegram-mirroring";
export function Mirroring() {
  return (
    <Tabs defaultValue="whatsapp" className="flex min-w-0 flex-col gap-6">
      <TabsList
        aria-label="Plataforma de espelhamento"
        className="bg-card grid h-auto w-full max-w-md shrink-0 grid-cols-2 gap-1 rounded-xl border p-1 shadow-sm"
      >
        <TabsTrigger
          value="whatsapp"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:hover:text-primary-foreground dark:data-[state=active]:hover:text-primary-foreground h-11 gap-2 rounded-lg px-5"
        >
          <AnimatedChannelIcon platform="whatsapp" compact />
          WhatsApp
        </TabsTrigger>
        <TabsTrigger
          value="telegram"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:hover:text-primary-foreground dark:data-[state=active]:hover:text-primary-foreground h-11 gap-2 rounded-lg px-5"
        >
          <AnimatedChannelIcon platform="telegram" compact />
          Telegram
        </TabsTrigger>
      </TabsList>
      <TabsContent value="whatsapp">
        <WhatsAppMirroring />
      </TabsContent>
      <TabsContent value="telegram">
        <TelegramMirroring />
      </TabsContent>
    </Tabs>
  );
}
