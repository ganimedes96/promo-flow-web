import Link from "next/link";
import { ArrowUpRight, ArrowUp } from "lucide-react";
export function Footer() {
  return (
    <footer className="flow-footer">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flow-footer-top">
          <Link href="/" className="flow-footer-brand">
            Promo<span>Flow</span>
            <ArrowUpRight />
          </Link>
          <nav aria-label="Links do rodapé">
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#extensao">Extensão</a>
            <Link href="/login">Entrar ↗</Link>
          </nav>
          <a
            href="#conteudo"
            className="flow-footer-back"
            aria-label="Voltar ao início"
          >
            <ArrowUp size={18} />
          </a>
        </div>
        <div className="flow-footer-bottom">
          <span>© {new Date().getFullYear()} PromoFlow</span>
          <span>Sua rotina de ofertas, organizada.</span>
          <span>
            <i />
            FEITO PARA DAR FLOW
          </span>
        </div>
      </div>
    </footer>
  );
}
