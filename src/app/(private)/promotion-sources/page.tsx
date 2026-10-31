import { MessageCircle, Send } from "lucide-react";
import { WhatsAppSources } from "./components/whatsapp-sources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { redirect } from "next/navigation";
import { SourcesManager } from "./components/sources-manager";
export default async function PromotionSourcesPage() {
  const response = await fetchServer<ApiResponse<{ role: string }>>("/auth/me");
  if (response.data.role !== "admin") redirect("/forbidden");
  return (
    <Tabs defaultValue="telegram" className="flex min-w-0 flex-col gap-6">
      <TabsList
        aria-label="Plataforma de coleta"
        className="bg-card grid h-auto w-full max-w-md shrink-0 grid-cols-2 gap-1 rounded-xl border p-1 shadow-sm"
      >
        <TabsTrigger
          value="telegram"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:hover:text-primary-foreground dark:data-[state=active]:hover:text-primary-foreground h-11 gap-2 rounded-lg px-5"
        >
          <Send className="size-4" /> Telegram
        </TabsTrigger>
        <TabsTrigger
          value="whatsapp"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground data-[state=active]:hover:text-primary-foreground dark:data-[state=active]:hover:text-primary-foreground h-11 gap-2 rounded-lg px-5"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </TabsTrigger>
      </TabsList>
      <TabsContent value="telegram" className="m-0 w-full min-w-0 flex-none">
        <SourcesManager />
      </TabsContent>
      <TabsContent value="whatsapp" className="m-0 w-full min-w-0 flex-none">
        <WhatsAppSources />
      </TabsContent>
    </Tabs>
  );
}
