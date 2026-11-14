"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { RotateCw, Laptop, LoaderCircle, Radio, Play, Square } from "lucide-react";
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
const actionNames = { START: "Iniciar", STOP: "Parar", RESTART: "Reiniciar", RECREATE: "Recriar containers" };
const commandNames = { QUEUED:"Aguardando o agente",RUNNING:"Executando no computador",SUCCEEDED:"Comando concluído",FAILED:"Não foi possível concluir",UNKNOWN:"Resultado sem confirmação",EXPIRED:"O agente não recebeu a tempo" };
const controlErrors: Record<string,string> = {
 DOCKER_UNAVAILABLE: "Abra o Docker Desktop no computador dos serviços e tente novamente.",
 DATA_NOT_MIGRATED: "Conclua a transferência das sessões para os volumes Docker antes de iniciar.",
 SOURCE_PROCESS_ACTIVE: "Existe outra execução usando as sessões. Encerre o processo antigo antes de continuar.",
 EXECUTION_TIMEOUT: "O Docker não confirmou a conclusão a tempo. Confira o estado atual antes de repetir.",
};
const serviceNames = {RUNNING:"Em execução",STOPPED:"Parado",STARTING:"Iniciando / encerrando",ERROR:"Falha no processo",EXTERNAL:"Em terminal externo",UNKNOWN:"Estado indisponível"};
export function LocalControlCard() {
 const { data:session } = useSession();
 const key=queryKeys.operations.localControl(session?.user.id);
 const query=useQuery({queryKey:key,queryFn:getLocalControl,enabled:!!session?.user.id,retry:false,refetchInterval:q=>q.state.error?false:30000,refetchIntervalInBackground:false});
 const [confirmation,setConfirmation]=useState<LocalAction|null>(null);
 const mutation=useServerAction({mutationFn:controlLocalServices,invalidateQueries:[key],successMessage:"Comando enviado. Aguarde a confirmação do agente.",onSuccess:()=>setConfirmation(null)});
 if(query.isPending)return <Skeleton className="h-56 rounded-xl" />;
 if(query.isError||!query.data)return <ApiErrorCard title="Não foi possível consultar o controle local" error={query.error} onRetry={()=>void query.refetch()} retrying={query.isFetching} />;
 const data=query.data, command=data.command;
 const pending=command?.status==='QUEUED'||command?.status==='RUNNING';
 const disabled=!data.online||pending||mutation.isPending;
 const docker=data.services.length===2&&data.services.every(service=>service.backend==='docker');
 const running=data.services.some(service=>service.status==='RUNNING');
 const allStopped=data.services.length===2&&data.services.every(service=>service.status==='STOPPED');
 const uncertain=data.services.length!==2||data.services.some(service=>['UNKNOWN','EXTERNAL','STARTING'].includes(service.status));
 const allRunning=data.services.length===2&&data.services.every(service=>service.status==='RUNNING');
 const dispatch=(action:LocalAction)=>mutation.mutate({action,idempotencyKey:crypto.randomUUID()});
 return <Card className="border-primary/30 overflow-hidden from-primary/15 via-card to-card bg-gradient-to-br">
 <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Laptop className="text-primary size-5" />Controle dos containers e serviços</CardTitle><Badge className={data.online?"bg-emerald-700 text-white":"bg-orange-600 text-white"}><Radio className="size-3" />{data.online?"Agente conectado":"Agente sem comunicação"}</Badge></div><CardDescription>Inicie ou encerre worker e coletor no seu computador. A ação afeta todos os clientes que usam esses serviços.</CardDescription></CardHeader>
 <CardContent className="space-y-4 pt-5">
 <div className="flex flex-wrap gap-2"><Badge variant="outline">{docker?"Docker · volumes persistentes":"Processos locais"}</Badge>{data.services.map(service=><Badge key={service.name} className={service.status==='RUNNING'?'bg-emerald-700 text-white':service.status==='STOPPED'?'bg-slate-700 text-white':'bg-amber-600 text-white'}>{service.name==='worker'?'Publicador':'Coletor'} · {data.online?serviceNames[service.status]:"Último estado: "+serviceNames[service.status]}</Badge>)}</div>
 <div className="flex flex-wrap items-center gap-3">
 <Button disabled={disabled||uncertain||allRunning} className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800" onClick={()=>dispatch('START')}>
 {pending&&command?.action==='START'?<LoaderCircle className="size-4 motion-safe:animate-spin" />:<Play className="size-4" />}
 {pending&&command?.action==='START'?"Iniciando…":docker?"Iniciar containers":"Iniciar serviços"}
 </Button>
 <Button variant="destructive" disabled={disabled||allStopped||(uncertain&&!docker)} className="gap-2" onClick={()=>setConfirmation('STOP')}>
 {pending&&command?.action==='STOP'?<LoaderCircle className="size-4 motion-safe:animate-spin" />:<Square className="size-4" />}
 {pending&&command?.action==='STOP'?"Desligando…":docker?"Desligar containers":"Desligar serviços"}
 </Button>
 <Button variant="outline" disabled={disabled||allStopped} onClick={()=>setConfirmation('RESTART')}><RotateCw className="size-4" />{docker?"Reiniciar containers":"Reiniciar serviços"}</Button>
 {docker&&<Button variant="outline" disabled={disabled} onClick={()=>setConfirmation('RECREATE')}><RotateCw className="size-4" />Recriar containers</Button>}
 <span role="status" className="text-muted-foreground text-xs">{!data.online ? "Aguardando agente" : uncertain ? "Aguardando confirmação do estado" : running ? data.services.every(service=>service.status==='RUNNING') ? null : "Serviços parcialmente ligados" : allStopped ? "Serviços desligados" : "Serviços precisam de atenção"}</span>
 </div>
 {!data.online&&<p className="text-muted-foreground text-xs">Mantenha o computador ligado, sem suspensão e com o agente local ativo. Comandos não são aceitos enquanto ele estiver sem comunicação.</p>}
 {command&&<div role="status" className="bg-muted/50 space-y-2 rounded-lg border p-3 text-xs"><p className="flex items-center gap-2 font-semibold">{pending&&<LoaderCircle className="size-3.5 motion-safe:animate-spin" />}{actionNames[command.action]} serviços · {commandNames[command.status]}</p><p className="text-muted-foreground">Solicitado em {formatDate(command.createdAt,"dd/MM/yyyy HH:mm:ss")}{command.finishedAt?" · Finalizado em "+formatDate(command.finishedAt,"dd/MM/yyyy HH:mm:ss"):""}</p>{command.status==='FAILED'&&<p>{controlErrors[command.errorCode??""]??"Confira os logs locais e se existe uma execução em outro terminal antes de tentar novamente."}</p>}{command.status==='UNKNOWN'&&<p>O comando não será repetido automaticamente. Confira o estado dos serviços acima antes de uma nova ação.</p>}</div>}
 {mutation.error&&<p role="alert" className="text-destructive text-xs">{mutation.error.message}</p>}
 <p className="text-muted-foreground text-xs">O agente permanece ativo ao parar os serviços. Sessões e recibos são preservados. Último contato: {data.lastSeenAt?formatDate(data.lastSeenAt,"dd/MM/yyyy HH:mm:ss"):"nenhum"}. Processo em execução não comprova captura ou entrega de mensagens.</p>
 </CardContent>
 <AlertDialog open={confirmation!==null} onOpenChange={open=>{if(!open)setConfirmation(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmation?actionNames[confirmation]:"Controlar"} {docker?"containers":"worker e coletor"}?</AlertDialogTitle><AlertDialogDescription>Essa ação afeta os envios e capturas de todos os clientes. O sistema aguardará o encerramento seguro das operações atuais e preservará as sessões. O agente de controle continuará disponível.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction disabled={disabled} onClick={()=>{if(confirmation)dispatch(confirmation);}}>Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </Card>;
}
