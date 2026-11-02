import { z } from "zod";
export const clientSchema=z.object({id:z.string().uuid(),name:z.string(),email:z.string(),phone:z.string(),createdAt:z.string(),updatedAt:z.string(),trialEndsAt:z.string(),isDisabled:z.boolean()});
const snapshot=z.object({trialEndsAt:z.string(),isDisabled:z.boolean()});
export const clientDetailSchema=z.object({client:clientSchema,history:z.array(z.object({id:z.string(),action:z.string(),reason:z.string().nullable(),before:snapshot,after:snapshot,createdAt:z.string()}))});
export const clientsSchema=z.object({items:clientSchema.array(),total:z.number(),page:z.number(),perPage:z.number()});
export type Client=z.infer<typeof clientSchema>;
export type ClientFilters={search:string;status:string;page:number};
export const changeClientSchema=z.object({requestId:z.string().uuid(),expectedUpdatedAt:z.string().datetime(),reason:z.string().trim().max(300).optional()}).and(z.discriminatedUnion('action',[
 z.object({action:z.literal('EXTEND_TRIAL'),days:z.number().int().min(1).max(365)}),z.object({action:z.literal('SET_ENABLED'),isEnabled:z.boolean()})]));
export type ChangeClient=z.infer<typeof changeClientSchema>;
