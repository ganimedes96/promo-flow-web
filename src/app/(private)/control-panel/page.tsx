import { getServerSession } from "@/lib/next-auth/auth";
import { WhatsAppConnection } from "./components/whatsapp-connection";
export default async function ControlPanelPage() {
  const session = await getServerSession();
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Painel de controle</h1>
        <p>Olá, {session?.user.name}</p>
        <p className="text-muted-foreground">
          Conecte seu WhatsApp para preparar o envio de ofertas aos seus grupos.
        </p>
      </div>
      <WhatsAppConnection />
    </>
  );
}
