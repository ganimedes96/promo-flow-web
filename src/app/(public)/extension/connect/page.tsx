import { getServerSession } from "@/lib/next-auth/auth";
import { ConnectExtension } from "./components/connect-extension";
export default async function ConnectExtensionPage() {
  const session = await getServerSession();
  return (
    <ConnectExtension
      account={
        session?.user
          ? { name: session.user.name || "", email: session.user.email || "" }
          : null
      }
    />
  );
}
