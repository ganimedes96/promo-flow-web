export interface AccountAccess {
  status: "TRIALING" | "ACTIVE" | "EXPIRED";
  canUseApp: boolean;
  trialEndsAt: string;
  subscriptionActiveUntil: string | null;
  daysRemaining: number;
  plan?: (SubscriptionPlan & { trialDays: number }) | null;
  usage?: {
    connections: number;
    groups: number;
    mirroredGroups: number;
    stores: number;
    publications: number;
  };
  publicationDay?: string;
  publicationTimezone?: string;
}
export interface SubscriptionPlan {
  code: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  maxGroups: number;
  maxConnections: number;
  maxMirroredGroups: number;
  maxDailyPublications: number;
  maxStores: number;
  watermarkEnabled: boolean;
}
