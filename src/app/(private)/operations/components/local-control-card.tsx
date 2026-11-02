"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { RotateCw, Laptop, LoaderCircle, Radio } from "lucide-react";
import { getLocalControl } from "@/domains/operations/client";
import { controlLocalServices } from "@/domains/operations/actions";
import type { LocalAction } from "@/domains/operations/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { formatDate } from "@/utils/date";
const actionNames = { START: "Iniciar", STOP: "Parar", RESTART: "Reiniciar" };
const commandNames = { QUEUED:"Aguardando o agente",RUNNING:"Executando no computador",SUCCEEDED:"Comando concluído",FAILED:"Não foi possível concluir",UNKNOWN:"Resultado sem confirmação",EXPIRED:"O agente não recebeu a tempo" };
const serviceNames = {RUNNING:"Em execução",STOPPED:"Parado",STARTING:"Iniciando / encerrando",ERROR:"Falha no processo",EXTERNAL:"Em terminal externo",UNKNOWN:"Estado indisponível"};
export function LocalControlCard() {
 const { data:session } = useSession();
 const key=queryKeys.operations.localControl(session?.user.id);
 const query=useQuery({queryKey:key,queryFn:getLocalControl,enabled:!!session?.user.id,retry:false,refetchInterval:q=>q.state.error?false:5000,refetchIntervalInBackground:false});
 const [confirmation,setConfirmation]=useState<LocalAction|null>(null);
 const mutation=useServerAction({mutationFn:controlLocalServices,invalidateQueries:[key],successMessage:"Comando enviado. Aguarde a confirmação do agente.",onSuccess:()=>setConfirmation(null)});
 if(query.isPending)return <Skeleton className="h-56 rounded-xl" />;
 if(query.isError||!query.data)return <ApiErrorCard title="Não foi possível consultar o controle local" error={query.error} onRetry={()=>void query.refetch()} retrying={query.isFetching} />;
 const data=query.data, command=data.command;
 const pending=command?.status==='QUEUED'||command?.status==='RUNNING';
 const disabled=!data.online||pending||mutation.isPending;
 const running=data.services.some(service=>service.status==='RUNNING');
 const allStopped=data.services.length===2&&data.services.every(service=>service.status==='STOPPED');
 const uncertain=data.services.length!==2||data.services.some(service=>['UNKNOWN','EXTERNAL','STARTING'].includes(service.status));
 const toggling=pending||mutation.isPending;
 const dispatch=(action:LocalAction)=>mutation.mutate({action,idempotencyKey:crypto.randomUUID()});
 return <Card className="border-primary/30 overflow-hidden from-primary/15 via-card to-card bg-gradient-to-br">
 <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Laptop className="text-primary size-5" />Controle dos serviços locais</CardTitle><Badge className={data.online?"bg-emerald-700 text-white":"bg-orange-600 text-white"}><Radio className="size-3" />{data.online?"Agente conectado":"Agente sem comunicação"}</Badge></div><CardDescription>Inicie ou encerre worker e coletor no seu computador. A ação afeta todos os clientes que usam esses serviços.</CardDescription></CardHeader>
 <CardContent className="space-y-4 pt-5">
 <div className="flex flex-wrap gap-2">{data.services.map(service=><Badge key={service.name} className={service.status==='RUNNING'?'bg-emerald-700 text-white':service.status==='STOPPED'?'bg-slate-700 text-white':'bg-amber-600 text-white'}>{service.name==='worker'?'Publicador':'Coletor'} · {data.online?serviceNames[service.status]:"Último estado: "+serviceNames[service.status]}</Badge>)}</div>
 <div className="flex flex-wrap items-center gap-3">
 <Button
   role="switch"
   aria-checked={running}
   aria-label={running ? "Desligar publicador e coletor" : "Ligar publicador e coletor"}
   disabled={disabled || uncertain}
   variant={running ? "default" : "outline"}
   className={running ? "h-12 gap-3 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800" : "h-12 gap-3 rounded-full px-5"}
   onClick={()=>{if(running)setConfirmation('STOP');else dispatch('START');}}
 >
   <span aria-hidden="true" className={"flex h-6 w-10 shrink-0 items-center rounded-full p-1 " + (running ? "bg-white/25" : "bg-muted-foreground/30")}>
     <span className={"size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none " + (running ? "translate-x-4" : "translate-x-0")} />
   </span>
   {toggling ? <><LoaderCircle className="size-4 motion-safe:animate-spin" />{command?.action==='STOP' ? "Desligando…" : command?.action==='RESTART' ? "Reiniciando…" : "Ligando…"}</> : running ? "Desligar serviços" : "Ligar serviços"}
 </Button>
 <Button variant="outline" disabled={disabled} onClick={()=>setConfirmation('RESTART')}><RotateCw className="size-4" />Reiniciar serviços</Button>
 <span role="status" className="text-muted-foreground text-xs">{!data.online ? "Aguardando agente" : uncertain ? "Aguardando confirmação do estado" : running ? data.services.every(service=>service.status==='RUNNING') ? "Serviços ligados" : "Serviços parcialmente ligados" : allStopped ? "Serviços desligados" : "Serviços precisam de atenção"}</span>
 </div>
 {!data.online&&<p className="text-muted-foreground text-xs">Mantenha o computador ligado, sem suspensão e com o agente local ativo. Comandos não são aceitos enquanto ele estiver sem comunicação.</p>}
 {command&&<div role="status" className="bg-muted/50 space-y-2 rounded-lg border p-3 text-xs"><p className="flex items-center gap-2 font-semibold">{pending&&<LoaderCircle className="size-3.5 motion-safe:animate-spin" />}{actionNames[command.action]} serviços · {commandNames[command.status]}</p><p className="text-muted-foreground">Solicitado em {formatDate(command.createdAt,"dd/MM/yyyy HH:mm:ss")}{command.finishedAt?" · Finalizado em "+formatDate(command.finishedAt,"dd/MM/yyyy HH:mm:ss"):""}</p>{command.status==='FAILED'&&<p>Confira os logs locais e se existe uma execução em outro terminal antes de tentar novamente.</p>}{command.status==='UNKNOWN'&&<p>O comando não será repetido automaticamente. Confira o estado dos serviços acima antes de uma nova ação.</p>}</div>}
 {mutation.error&&<p role="alert" className="text-destructive text-xs">{mutation.error.message}</p>}
 <p className="text-muted-foreground text-xs">O agente permanece ativo ao parar os serviços. Sessões e recibos são preservados. Último contato: {data.lastSeenAt?formatDate(data.lastSeenAt,"dd/MM/yyyy HH:mm:ss"):"nenhum"}. Processo em execução não comprova captura ou entrega de mensagens.</p>
 </CardContent>
 <AlertDialog open={confirmation!==null} onOpenChange={open=>{if(!open)setConfirmation(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmation?actionNames[confirmation]:"Controlar"} worker e coletor?</AlertDialogTitle><AlertDialogDescription>Essa ação afeta os envios e capturas de todos os clientes. O sistema aguardará o encerramento seguro das operações atuais e preservará as sessões. O agente de controle continuará disponível.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction disabled={disabled} onClick={()=>{if(confirmation)dispatch(confirmation);}}>Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </Card>;
}
