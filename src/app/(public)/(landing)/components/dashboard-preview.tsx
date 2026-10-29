"use client";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCheck,
  Clock3,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Pause,
  Play,
  Send,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const periods = {
  Hoje: {
    published: 24,
    queued: 8,
    groups: 4,
    bars: [22, 38, 30, 56, 46, 72, 60, 90, 76, 98, 82, 94],
    labels: ["08h", "10h", "12h", "14h", "16h", "18h"],
  },
  Semana: {
    published: 148,
    queued: 12,
    groups: 6,
    bars: [34, 50, 42, 66, 58, 84, 72, 94, 78, 88, 95, 100],
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  },
};
type Period = keyof typeof periods;
export function DashboardPreview() {
  const [period, setPeriod] = useState<Period>("Hoje");
  const [paused, setPaused] = useState(false);
  const data = periods[period];
  return (
    <section
      id="painel"
      className={`flow-dashboard-section ${paused ? "flow-paused" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="flow-dashboard-intro">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              Um olhar para o que vem aí
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Sua operação.
              <br />
              Uma visão completa.
            </h2>
          </div>
          <div className="max-w-sm">
            <span className="flow-coming-badge">
              <Zap size={12} />
              Dashboard em planejamento
            </span>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Uma prévia de como acompanhar o ritmo das ofertas, seus grupos e
              as próximas publicações. Explore a demonstração abaixo.
            </p>
          </div>
        </div>
        <div className="flow-dashboard-window">
          <div className="flow-dashboard-browser">
            <div aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span>promoflow / visão da operação</span>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play /> : <Pause />}
              <span>{paused ? "Retomar animações" : "Pausar animações"}</span>
            </Button>
          </div>
          <div className="flow-dashboard-shell">
            <div className="flow-dashboard-rail" aria-hidden="true">
              <span className="flow-rail-logo">pf.</span>
              <LayoutDashboard />
              <ShoppingBag />
              <Users />
              <MessageCircle />
              <span className="flow-rail-bottom">
                <Activity />
              </span>
            </div>
            <div className="flow-dashboard-content">
              <div className="flow-dashboard-heading">
                <div>
                  <span className="flow-mono">SEU DIA, EM MOVIMENTO</span>
                  <h3>
                    Visão da operação<span>↗</span>
                  </h3>
                </div>
                <div
                  className="flow-dashboard-period"
                  role="group"
                  aria-label="Período da demonstração"
                >
                  {(Object.keys(periods) as Period[]).map((value) => (
                    <Button
                      key={value}
                      variant="ghost"
                      size="sm"
                      aria-pressed={period === value}
                      onClick={() => setPeriod(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flow-dashboard-stats" key={period}>
                {[
                  {
                    label: "Ofertas publicadas",
                    value: data.published,
                    icon: Send,
                    note: "Publicações concluídas",
                  },
                  {
                    label: "Na fila",
                    value: data.queued,
                    icon: Clock3,
                    note: "Próximos envios",
                  },
                  {
                    label: "Grupos ativos",
                    value: data.groups,
                    icon: Users,
                    note: "Seus destinos favoritos",
                  },
                ].map(({ label, value, icon: Icon, note }) => (
                  <div className="flow-stat" key={label}>
                    <span className="flow-stat-label">
                      {label}
                      <Icon size={16} />
                    </span>
                    <strong>
                      {value.toString().padStart(2, "0")}
                      <ArrowUpRight size={20} />
                    </strong>
                    <span className="flow-stat-note">{note}</span>
                  </div>
                ))}
              </div>
              <div className="flow-dashboard-panels">
                <div className="flow-chart-panel">
                  <div className="flow-panel-heading">
                    <span>
                      <BarChart3 size={15} />
                      Ritmo de publicações
                    </span>
                    <span className="flow-chart-legend">
                      <i />
                      Enviadas
                    </span>
                  </div>
                  <div
                    className="flow-bars"
                    key={period}
                    role="img"
                    aria-label={`Gráfico ilustrativo: ${data.published} publicações no período ${period.toLowerCase()}`}
                  >
                    <div className="flow-chart-grid" aria-hidden="true" />
                    {data.bars.map((height, index) => (
                      <div
                        key={index}
                        className="flow-bar-track"
                        aria-hidden="true"
                      >
                        <div
                          className="flow-bar"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${index * 55}ms`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flow-chart-labels" aria-hidden="true">
                    {data.labels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="flow-chart-summary">
                    <span className="flow-signal">
                      <Activity size={14} />
                    </span>
                    Seu fluxo ganhando forma<span>EXEMPLO</span>
                  </div>
                </div>
                <div className="flow-queue-panel">
                  <div className="flow-panel-heading">
                    <span>
                      <Clock3 size={15} />
                      Próximas da fila
                    </span>
                    <span>03</span>
                  </div>
                  {[
                    {
                      title: "Fone Bluetooth",
                      group: "Achados de tecnologia",
                      time: "14:32",
                      icon: Headphones,
                    },
                    {
                      title: "Kit de camisetas",
                      group: "Ofertas do dia",
                      time: "14:34",
                      icon: ShoppingBag,
                    },
                    {
                      title: "Acessórios para casa",
                      group: "Casa & boas compras",
                      time: "14:36",
                      icon: ShoppingBag,
                    },
                  ].map(({ title, group, time, icon: Icon }, index) => (
                    <div
                      className="flow-queue-item"
                      key={title}
                      style={{ animationDelay: `${index * 130}ms` }}
                    >
                      <span className="flow-queue-art">
                        <Icon size={20} />
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <span>{group}</span>
                      </div>
                      <time>{time}</time>
                    </div>
                  ))}
                  <div className="flow-queue-footer">
                    <CheckCheck size={16} />
                    <span>Horários organizados por grupo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flow-dashboard-footnote">
            <span>
              <Check size={13} />
              Prévia conceitual • dados fictícios
            </span>
            <span>Este dashboard ainda não está disponível no sistema.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
