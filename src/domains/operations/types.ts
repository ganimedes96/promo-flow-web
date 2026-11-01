import { z } from "zod";
const runtime = z.object({
  status: z.enum(["ONLINE", "OFFLINE", "NOT_STARTED"]),
  lastSeenAt: z.string().nullable(),
  stoppedAt: z.string().nullable(),
});
export const operationsSchema = z.object({
  checkedAt: z.string(),
  api: z.literal("AVAILABLE"),
  worker: runtime.extend({ publishingEnabled: z.boolean() }),
  collector: runtime.extend({
    telegramEnabled: z.boolean(),
    whatsappEnabled: z.boolean(),
  }),
  queue: z.object({
    scheduled: z.number(),
    sending: z.number(),
    unconfirmed: z.number(),
    failed: z.number(),
  }),
});
export type OperationsStatus = z.infer<typeof operationsSchema>;

export const supportUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
});
const connectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  isPaused: z.boolean(),
  connectedName: z.string().nullable(),
  lastError: z.string().nullable(),
  lastConnectedAt: z.string().nullable(),
  lastDisconnectedAt: z.string().nullable(),
  updatedAt: z.string(),
});
const attemptSchema = z.object({
  id: z.string(),
  attempt: z.number(),
  status: z.string(),
  errorMessage: z.string().nullable(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});
const supportOfferSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  scheduledAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  errorMessage: z.string().nullable(),
  blockedReason: z.string().nullable(),
  attempts: z.number(),
  lastAttemptAt: z.string().nullable(),
  mirrorAffiliateStatus: z.string().nullable(),
  connection: z
    .object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      isPaused: z.boolean(),
    })
    .nullable(),
  whatsappGroup: z.object({ id: z.string(), name: z.string() }).nullable(),
  mirrorConversion: z
    .object({
      status: z.string(),
      attempts: z.number(),
      lastErrorCode: z.string().nullable(),
      nextAttemptAt: z.string(),
    })
    .nullable(),
  publicationAttempts: z.array(attemptSchema),
});
const diagnosticSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  statusCode: z.number(),
  method: z.string(),
  route: z.string(),
  errorType: z.string(),
  createdAt: z.string(),
});
export const supportSchema = z.object({
  user: supportUserSchema,
  status: operationsSchema,
  connections: z.array(connectionSchema),
  offers: z.object({
    items: z.array(supportOfferSchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
  }),
  errors: z.object({
    items: z.array(diagnosticSchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
  }),
});
export type SupportOffer = z.infer<typeof supportOfferSchema>;
export type SupportDiagnostic = z.infer<typeof diagnosticSchema>;
export type SupportFilters = {
  userId: string;
  page: number;
  errorPage: number;
  status?: string;
};

export const localControlSchema = z.object({
 online: z.boolean(), lastSeenAt: z.string().nullable(),
 services: z.array(z.object({ name: z.enum(['worker','collector']), status: z.enum(['RUNNING','STOPPED','STARTING','ERROR','EXTERNAL','UNKNOWN']) })),
 command: z.object({ id: z.string(), action: z.enum(['START','STOP','RESTART']), status: z.enum(['QUEUED','RUNNING','SUCCEEDED','FAILED','UNKNOWN','EXPIRED']), createdAt: z.string(), finishedAt: z.string().nullable(), errorCode: z.string().nullable() }).nullable(),
});
export type LocalControl = z.infer<typeof localControlSchema>;
export type LocalAction = 'START'|'STOP'|'RESTART';
