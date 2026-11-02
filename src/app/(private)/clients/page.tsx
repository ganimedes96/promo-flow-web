import { CanServer } from "@/components/can/server";
import { Permission } from "@/domains/auth/enums";
import { ClientsPanel } from "./components/clients-panel";
export default function ClientsPage(){return <CanServer permission={Permission.managePromotions} fallback={<p>Acesso exclusivo do administrador.</p>}><ClientsPanel /></CanServer>;}
