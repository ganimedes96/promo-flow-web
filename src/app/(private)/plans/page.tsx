import { CanServer } from "@/components/can/server";
import { Permission } from "@/domains/auth/enums";
import { PlansPanel } from "./components/plans-panel";
export default function PlansPage() {
  return (
    <CanServer
      permission={Permission.managePromotions}
      fallback={<p>Acesso exclusivo do administrador.</p>}
    >
      <PlansPanel />
    </CanServer>
  );
}
