"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  CheckCircle2,
  Layers3,
  MessageCircle,
  Radio,
  Send,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { useSubscription } from "@/domains/billing/use-subscription";
import type { SubscriptionPlan } from "@/domains/billing/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "./subscription-checkout";
import styles from "./subscription-plans.module.css";

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100
  );
export function SubscriptionPlans({ plans }: { plans: SubscriptionPlan[] }) {
  const subscription = useSubscription();
  const [selected, setSelected] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [border, setBorder] = useState<CSSProperties>({ opacity: 0 });
  const current = subscription.data?.subscription;
  const currentCode =
    current && !["CANCELLED", "EXPIRED", "FAILED"].includes(current.status)
      ? current.planCode
      : null;
  const active = plans.some((p) => p.code === selected)
    ? selected
    : plans.some((p) => p.code === currentCode)
      ? currentCode
      : plans[0]?.code;
  useLayoutEffect(() => {
    const parent = grid.current;
    if (!parent) return;
    const measure = () => {
      const card = Array.from(
        parent.querySelectorAll<HTMLElement>("[data-plan-card]")
      ).find((node) => node.dataset.planCard === active);
      if (!card) return;
      setBorder({
        opacity: 1,
        width: card.offsetWidth,
        height: card.offsetHeight,
        transform: `translate(${card.offsetLeft}px, ${card.offsetTop}px)`,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    for (const child of parent.querySelectorAll<HTMLElement>(
      "[data-plan-card]"
    ))
      observer.observe(child);
    return () => observer.disconnect();
  }, [active, plans]);
  return (
    <div ref={grid} className={styles.grid}>
      <div aria-hidden="true" className={styles.selection} style={border} />
      {plans.map((plan, index) => {
        const chosen = active === plan.code;
        const isCurrent = currentCode === plan.code;
        const Icon = plan.code === "PROFESSIONAL" ? Sparkles : Layers3;
        const features = [
          {
            icon: MessageCircle,
            label: "Conexões WhatsApp",
            value: plan.maxConnections,
          },
          { icon: Users, label: "Grupos de destino", value: plan.maxGroups },
          {
            icon: Radio,
            label: "Origens espelhadas",
            value: plan.maxMirroredGroups,
          },
          {
            icon: Send,
            label: "Publicações por dia",
            value: plan.maxDailyPublications,
          },
          { icon: Store, label: "Lojas configuradas", value: plan.maxStores },
        ];
        return (
          <div
            key={plan.code}
            data-plan-card={plan.code}
            className={styles.slot}
            onClick={() => setSelected(plan.code)}
          >
            <Card
              className={`${styles.card} ${chosen ? styles.chosen : ""}`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div aria-hidden="true" className={styles.glow} />
              <CardHeader className="relative gap-4">
                <div className="flex min-h-7 items-center justify-between gap-2">
                  <span className={styles.icon}>
                    <Icon className="size-5" />
                  </span>
                  {isCurrent ? (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-foreground"
                    >
                      Seu plano atual
                    </Badge>
                  ) : (
                    <Badge variant="outline">Mensal</Badge>
                  )}
                </div>
                <button
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => setSelected(plan.code)}
                  className="focus-visible:ring-primary flex w-full items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <span className="text-2xl font-semibold tracking-tight">
                    {plan.name}
                  </span>
                  <span
                    className={`${styles.check} ${chosen ? styles.checked : ""}`}
                    aria-hidden="true"
                  >
                    {chosen && <Check className="size-3.5" />}
                  </span>
                </button>
                <CardDescription className="min-h-10">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex-1 space-y-6">
                <div className="border-border/70 border-b pb-5">
                  <p className="flex flex-wrap items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {money(plan.monthlyPriceCents)}
                    </span>
                    <span className="text-muted-foreground mb-1 text-sm">
                      / mês
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Cobrança recorrente · cancele a renovação quando precisar
                  </p>
                </div>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.label} className={styles.feature}>
                      <feature.icon className="text-primary size-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">
                        {feature.label}
                      </span>
                      <strong className="tabular-nums">{feature.value}</strong>
                    </li>
                  ))}
                </ul>
                <div className="bg-primary/5 flex items-start gap-2 rounded-xl p-3">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Central de promoções, extensão, agendamento e mensagens
                    personalizadas incluídos.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="relative flex-col items-stretch gap-3">
                <SubscribeButton plan={plan} />
                <p className="text-muted-foreground text-center text-xs">
                  {chosen
                    ? "Plano selecionado para comparação"
                    : "Clique no card para comparar este plano"}
                </p>
              </CardFooter>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
