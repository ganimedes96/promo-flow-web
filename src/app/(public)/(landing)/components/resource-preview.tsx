import { Check, CheckCheck, Headphones, Star, Wifi } from "lucide-react";
export function ResourcePreview({ index }: { index: number }) {
  if (index === 0)
    return (
      <div
        className="flow-resource-preview flow-resource-import"
        aria-hidden="true"
      >
        <div className="flow-mini-browser">
          <span>● ● ●</span>
          <span>produto / seu próximo achado</span>
        </div>
        <div className="flow-mini-product">
          <span>
            <Headphones />
          </span>
          <div>
            <i />
            <i />
            <b>R$ 149,90</b>
          </div>
          <span className="flow-mini-capture">↗</span>
        </div>
        <div className="flow-mini-fields">
          <span>
            <Check />
            Título
          </span>
          <span>
            <Check />
            Imagens
          </span>
          <span>
            <Check />
            Preço
          </span>
        </div>
        <span className="flow-resource-demo-label">EXEMPLO DE CAPTURA</span>
      </div>
    );
  if (index === 1)
    return (
      <div
        className="flow-resource-preview flow-resource-groups"
        aria-hidden="true"
      >
        {["Ofertas do dia", "Casa & achados", "Tecnologia"].map((label, i) => (
          <div key={label}>
            <span>{["OD", "CA", "TC"][i]}</span>
            <b>{label}</b>
            <Star size={12} fill="currentColor" />
          </div>
        ))}
      </div>
    );
  if (index === 2)
    return (
      <div
        className="flow-resource-preview flow-resource-queue"
        aria-hidden="true"
      >
        {["14:32", "14:34", "14:36"].map((time, i) => (
          <div key={time}>
            <span>{time}</span>
            <i />
            <b>{i === 0 ? "Publicada" : "Na fila"}</b>
          </div>
        ))}
        <span className="flow-resource-demo-label">HORÁRIOS ILUSTRATIVOS</span>
      </div>
    );
  if (index === 3)
    return (
      <div
        className="flow-resource-preview flow-resource-message"
        aria-hidden="true"
      >
        <div>
          <span>
            <Headphones size={25} />
          </span>
          <strong>Bom achado do dia</strong>
          <small>
            De: <s>R$ 199,90</s>
          </small>
          <b>Por: R$ 149,90</b>
          <em>−25% • seu link ↗</em>
          <CheckCheck size={12} />
        </div>
      </div>
    );
  if (index === 4)
    return (
      <div
        className="flow-resource-preview flow-resource-review"
        aria-hidden="true"
      >
        <span className="flow-resource-shield">
          <Check size={28} />
        </span>
        <strong>Você confere.</strong>
        <span>Depois, coloca no fluxo.</span>
        <div>
          <i />
          Imagem
          <i />
          Preço
          <i />
          Destino
        </div>
      </div>
    );
  return (
    <div
      className="flow-resource-preview flow-resource-connection"
      aria-hidden="true"
    >
      <div className="flow-resource-radar">
        <i />
        <i />
        <Wifi size={26} />
      </div>
      <div>
        <span className="flow-status-dot" />
        Conexão acompanhada
      </div>
      <p>WhatsApp + publicador local</p>
      <span className="flow-resource-demo-label">PRÉVIA ILUSTRATIVA</span>
    </div>
  );
}
