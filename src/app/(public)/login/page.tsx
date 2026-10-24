import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="from-background via-background/90 to-muted flex min-h-svh flex-col items-center justify-center bg-linear-to-br p-6 md:p-10">
      <div className="bg-card border-border w-full max-w-md space-y-6 rounded-xl border p-8 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex items-center">
            <h1 className="text-primary text-4xl font-bold">Promo</h1>
            <h1 className="text-4xl font-bold">Flow</h1>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-xl font-semibold">
            Acesse sua conta
          </h2>
          <p className="text-muted-foreground text-sm">
            Entre para conectar seu WhatsApp e acompanhar seus grupos.
          </p>
        </div>
        <LoginForm />
      </div>
      <footer className="text-muted-foreground mt-10 text-center text-xs">
        © {new Date().getFullYear()}{" "}
        <span className="font-medium">PromoFlow</span> — Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
