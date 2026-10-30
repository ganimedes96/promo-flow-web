"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { registerAccount } from "@/domains/auth/actions";
import {
  RegisterAccount,
  RegisterForm,
  registerFormSchema,
  registerAccountSchema,
} from "@/domains/auth/registration";
import { useServerAction } from "@/hooks/use-server-action";
export function RegisterFormFields({
  importingProduct,
  connectingExtension = false,
}: {
  importingProduct: boolean;
  connectingExtension?: boolean;
}) {
  const router = useRouter();
  const [created, setCreated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const registration = useServerAction<{ email: string }, RegisterAccount>({
    mutationFn: registerAccount,
    disableSuccessToast: true,
    onSuccess: async (_response, body) => {
      setCreated(true);
      try {
        const result = await signIn("credentials", {
          email: body.email,
          password: body.password,
          redirect: false,
        });
        if (!result?.ok || result.error) {
          setLoginError("Conta criada. Faça login para continuar.");
          return;
        }
        router.replace(
          connectingExtension
            ? "/extension/connect"
            : importingProduct
              ? "/import-product"
              : "/control-panel"
        );
        router.refresh();
      } catch {
        setLoginError("Conta criada. Faça login para continuar.");
      }
    },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        const parsed = registerFormSchema.safeParse(values);
        if (!parsed.success) {
          setError("root", {
            message: parsed.error.issues[0]?.message || "Confira seus dados.",
          });
          return;
        }
        const body = registerAccountSchema.parse(parsed.data);
        registration.mutate(body);
      })}
    >
      <ControlledInput
        control={control}
        name="name"
        label="Seu nome"
        placeholder="Como podemos chamar você?"
        autoComplete="name"
        rules={{ required: "Informe seu nome." }}
      />
      <ControlledInput
        control={control}
        name="email"
        label="Email"
        placeholder="voce@email.com"
        type="email"
        autoComplete="email"
        rules={{ required: "Informe seu email." }}
      />
      <ControlledInput
        control={control}
        name="phone"
        label="Telefone com DDD"
        placeholder="+55 85 99999-9999"
        type="tel"
        autoComplete="tel"
        rules={{ required: "Informe seu telefone." }}
      />
      <ControlledInput
        control={control}
        name="password"
        label="Senha"
        placeholder="Pelo menos 8 caracteres, com letra e número"
        type="password"
        autoComplete="new-password"
        maxLength={72}
        rules={{ required: "Crie uma senha." }}
      />
      <ControlledInput
        control={control}
        name="confirmPassword"
        label="Confirmar senha"
        placeholder="Repita sua senha"
        type="password"
        autoComplete="new-password"
        maxLength={72}
        rules={{ required: "Confirme sua senha." }}
      />
      {(registration.error || errors.root || loginError) && (
        <Alert variant={created ? "default" : "destructive"}>
          <AlertDescription>
            {loginError || registration.error?.message || errors.root?.message}
          </AlertDescription>
        </Alert>
      )}
      <p className="text-muted-foreground text-xs leading-relaxed">
        Teste por 10 dias, sem cadastrar cartão. Ao terminar, consulte os planos
        de assinatura para continuar.
      </p>
      <Button
        type="submit"
        loading={registration.isPending}
        disabled={registration.isPending || created}
        className="w-full"
      >
        {created ? "Conta criada" : "Criar conta e iniciar teste"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Já tem uma conta?{" "}
        <Link
          className="text-primary font-medium underline"
          href={
            connectingExtension
              ? "/login?extension=connect"
              : importingProduct
                ? "/login?import=product"
                : "/login"
          }
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
