"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import type { LocalAction } from "./types";
const inputSchema = z.object({ action: z.enum(['START','STOP','RESTART','RECREATE']), idempotencyKey: z.string().uuid() });
export async function controlLocalServices(input: { action: LocalAction; idempotencyKey: string }): Promise<ApiResponse<{id:string;status:string}>|ApiResponseError> {
 try { return await fetchServer<ApiResponse<{id:string;status:string}>>("/operations/local-control/commands", {method:"POST",body:inputSchema.parse(input)}); }
 catch(error) { return {status:"error",code:400,timestamp:new Date().toISOString(),message:error instanceof Error ? error.message : typeof error==='object' && error!==null && 'message' in error && typeof error.message==='string' ? error.message : "Não foi possível enviar o comando."}; }
}
