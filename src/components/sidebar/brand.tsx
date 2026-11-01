import Link from "next/link";
import { Tags } from "lucide-react";
import styles from "./brand.module.css";
export function SidebarBrand() {
  return (
    <Link
      href="/control-panel"
      aria-label="PromoFlow — Painel de controle"
      className="group focus-visible:ring-primary focus-visible:ring-offset-sidebar flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
    >
      <span
        aria-hidden="true"
        className={`border-primary/25 bg-primary/10 text-primary relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${styles.symbol}`}
      >
        <Tags className="size-5" />
        <span className={styles.shine} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sidebar-foreground text-[25px] leading-none font-black tracking-[-0.065em]">
          Promo
          <span className="text-primary ml-0.5 font-extrabold italic">
            Flow
          </span>
        </span>
        <span className="text-muted-foreground mt-1.5 text-[8px] leading-none font-semibold tracking-[0.18em] uppercase">
          Ofertas em movimento
        </span>
      </span>
    </Link>
  );
}
