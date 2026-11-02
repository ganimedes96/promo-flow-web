import {
  Headphones,
  Coffee,
  Shirt,
  Check,
  ArrowRight,
  Link2,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { ResourcePreview } from "./resource-preview";
import type { FeatureKind } from "./feature-slides";
import styles from "./feature-carousel.module.css";
export function FeatureDemo({ kind }: { kind: FeatureKind }) {
  if (kind === "capture") return <ResourcePreview index={0} />;
  if (kind === "message") return <ResourcePreview index={3} />;
  if (kind === "groups") return <ResourcePreview index={1} />;
  if (kind === "queue") return <ResourcePreview index={2} />;
  return (
    <div className={styles.demoScene} aria-hidden="true">
      {kind === "catalog" && (
        <>
          <div className={styles.filters}>
            <span>Todos</span>
            <span>Casa</span>
            <span>Tecnologia</span>
          </div>
          <div className={styles.products}>
            {[
              {
                Icon: Headphones,
                name: "Fone Bluetooth",
                price: "R$ 59,90",
                tag: "NOVO",
              },
              {
                Icon: Coffee,
                name: "Cafeteira elétrica",
                price: "R$ 99,90",
                tag: "−40%",
              },
              {
                Icon: Shirt,
                name: "Kit de camisetas",
                price: "R$ 79,90",
                tag: "ACHADO",
              },
            ].map(({ Icon, name, price, tag }, i) => (
              <div key={name} style={{ animationDelay: `${i * 1.2}s` }}>
                <span className={styles.productIcon}>
                  <Icon size={23} />
                </span>
                <span>
                  <strong>{name}</strong>
                  <b>{price}</b>
                </span>
                <em>{tag}</em>
              </div>
            ))}
          </div>
        </>
      )}
      {kind === "mirror" && (
        <div className={styles.mirror}>
          <div>
            <span>
              <MessageCircle size={17} />
              Grupo de achados
            </span>
            <span>
              <Send size={17} />
              Canal de ofertas
            </span>
          </div>
          <ArrowRight className={styles.travelling} size={25} />
          <div className={styles.privateOffer}>
            <Sparkles size={23} />
            <strong>Nova oferta para você</strong>
            <small>Privada · escolha o destino</small>
          </div>
        </div>
      )}
      {kind === "affiliate" && (
        <div className={styles.affiliate}>
          <span className={styles.storePill}>Mercado Livre + Shopee</span>
          <div>
            <Link2 size={25} />
            <span className={styles.conversionLine} />
            <CheckCheck size={30} />
          </div>
          <span className={styles.originalLink}>Link do produto</span>
          <strong>
            Seu link aplicado <Check size={16} />
          </strong>
          <small>Gerado pela sua conta no navegador</small>
        </div>
      )}
      {kind === "watermark" && (
        <div className={styles.watermark}>
          <div className={styles.watermarkTabs}>
            <span>Imagem</span>
            <span>Prévia do link</span>
          </div>
          <div className={styles.productPhoto}>
            <Headphones size={82} strokeWidth={1.4} />
            <span>@seugrupo</span>
            <ImageIcon size={14} />
          </div>
          <strong>Fone Bluetooth</strong>
          <span>
            De <s>R$ 99,90</s> por <b>R$ 59,90</b>
          </span>
        </div>
      )}
      {kind === "history" && (
        <div className={styles.history}>
          {[
            {
              name: "Fone Bluetooth",
              label: "Publicada",
              time: "14:32",
              ok: true,
            },
            {
              name: "Cafeteira elétrica",
              label: "Agendada",
              time: "14:34",
              ok: false,
            },
            {
              name: "Kit de camisetas",
              label: "Publicada",
              time: "14:30",
              ok: true,
            },
          ].map(({ name, label, time, ok }) => (
            <div key={name}>
              <span className={ok ? styles.successDot : styles.waitingDot} />
              <strong>{name}</strong>
              <span>{label}</span>
              <small>{time}</small>
            </div>
          ))}
          <p>
            <CheckCheck size={15} />
            Seu histórico, sempre por perto.
          </p>
        </div>
      )}
    </div>
  );
}
