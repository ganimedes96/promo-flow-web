import { getServerSession } from "@/lib/next-auth/auth";
import { WhatsAppConnection } from "./components/whatsapp-connection";
export default async function Dashboard() {
  const session = await getServerSession();
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Olá, {session?.user.name}</h2>
        <p className="text-muted-foreground">
          Conecte seu WhatsApp para preparar o envio de ofertas aos seus grupos.
        </p>
      </div>
      <WhatsAppConnection />
    </>
  );
}
