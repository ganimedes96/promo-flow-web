import { fetchClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import { clientsSchema,clientDetailSchema,type ClientFilters } from "./types";
export async function getClients(filters:ClientFilters){const params=new URLSearchParams({search:filters.search,status:filters.status,page:String(filters.page)});const response=await fetchClient<ApiResponse<unknown>>("/clients?"+params,{cache:"no-store"});return clientsSchema.parse(response.data);}
export async function getClient(id:string){const response=await fetchClient<ApiResponse<unknown>>("/clients/"+encodeURIComponent(id),{cache:"no-store"});return clientDetailSchema.parse(response.data);}
