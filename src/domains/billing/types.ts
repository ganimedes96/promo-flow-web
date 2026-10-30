export interface AccountAccess {
  status: "TRIALING" | "ACTIVE" | "EXPIRED";
  canUseApp: boolean;
  trialEndsAt: string;
  subscriptionActiveUntil: string | null;
  daysRemaining: number;
}
export interface SubscriptionPlan {
  code: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  maxGroups: number;
  maxConnections: number;
}
