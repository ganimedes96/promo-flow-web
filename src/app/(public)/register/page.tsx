import Link from "next/link";
import { RegisterFormFields } from "./components/register-form";
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ import?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="app-surface-bg flex min-h-svh flex-col items-center justify-center px-5 py-10">
      <div className="bg-card w-full max-w-lg space-y-7 rounded-2xl border p-7 shadow-lg sm:p-9">
        <div>
          <Link href="/" className="text-2xl font-bold">
            Promo<span className="text-primary">Flow</span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold">
            Seu primeiro achado começa aqui.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Crie sua conta, conecte seu WhatsApp e experimente por 10 dias.
          </p>
        </div>
        <RegisterFormFields importingProduct={params.import === "product"} />
      </div>
      <Link href="/" className="text-muted-foreground mt-6 text-sm underline">
        Voltar à apresentação
      </Link>
    </main>
  );
}
