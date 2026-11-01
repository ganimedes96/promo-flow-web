import { CanServer } from "@/components/can/server";
import { Permission } from "@/domains/auth/enums";
import { OperationsPanel } from "./components/operations-panel";
export default function OperationsPage() {
  return (
    <CanServer
      permission={Permission.managePromotions}
      fallback={<p>Acesso exclusivo do administrador.</p>}
    >
      <OperationsPanel />
    </CanServer>
  );
}
