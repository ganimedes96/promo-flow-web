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
    <Tabs defaultValue="telegram" className="space-y-5">
      <TabsList>
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
      </TabsList>
      <TabsContent value="telegram">
        <SourcesManager />
      </TabsContent>
      <TabsContent value="whatsapp">
        <WhatsAppSources />
      </TabsContent>
    </Tabs>
  );
}
