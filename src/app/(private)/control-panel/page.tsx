import { GettingStartedGuide } from "./components/getting-started/guide";
import { getServerSession } from "@/lib/next-auth/auth";
import { ChannelOverview } from "./components/channel-overview";

export default async function ControlPanelPage() {
  const session = await getServerSession();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {session?.user.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Seus canais e o próximo passo para mandar boas ofertas.
        </p>
      </header>
      {session?.user.id && <GettingStartedGuide userId={session.user.id} />}
      <ChannelOverview />
    </div>
  );
}
