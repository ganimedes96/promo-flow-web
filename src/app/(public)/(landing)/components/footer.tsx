import Link from "next/link";
export function Footer() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-8 text-xs sm:flex-row">
        <Link
          href="/"
          className="text-foreground text-xl font-semibold tracking-tight"
        >
          Promo<span className="text-primary">Flow</span>
        </Link>
        <p>
          © {new Date().getFullYear()} PromoFlow. Sua rotina de ofertas,
          organizada.
        </p>
        <Link href="/login" className="hover:text-foreground">
          Acessar o sistema →
        </Link>
      </div>
    </footer>
  );
}
