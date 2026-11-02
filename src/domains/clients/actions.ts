"use server";
import { z } from "zod";
import { fetchServer } from "@/api/server";
import type { ApiResponse,ApiResponseError } from "@/api/types";
import { changeClientSchema,type Client,type ChangeClient } from "./types";
export async function changeClientAccess(input:{id:string;change:ChangeClient}):Promise<ApiResponse<Client>|ApiResponseError>{
 try{return await fetchServer<ApiResponse<Client>>("/clients/"+z.string().uuid().parse(input.id)+"/access",{method:"PUT",body:changeClientSchema.parse(input.change)});}
 catch(error){return {status:"error",code:400,timestamp:new Date().toISOString(),message:error instanceof Error?error.message:typeof error==='object'&&error!==null&&'message' in error&&typeof error.message==='string'?error.message:"Não foi possível atualizar o cliente."};}
}
