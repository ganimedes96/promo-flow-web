import { Badge } from "@/components/ui/badge";
import type { Client } from "@/domains/clients/types";
export function ClientStatus({client}:{client:Client}){return <Badge className={client.isDisabled?"justify-center bg-rose-700 text-white":"justify-center bg-emerald-700 text-white"}>{client.isDisabled?"Desativada":"Ativa"}</Badge>;}
