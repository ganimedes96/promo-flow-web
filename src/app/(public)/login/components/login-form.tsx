"use client";

import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Credentials } from "@/domains/auth/types";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Credentials>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (data: Credentials) => {
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError(
          "Não foi possível entrar. Confira seu email e senha e tente novamente."
        );
        return;
      }
      const importing =
        new URLSearchParams(window.location.search).get("import") === "product";
      router.replace(importing ? "/import-product" : "/control-panel");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <ControlledInput
          id="email"
          control={control}
          type="email"
          autoComplete="username"
          placeholder="seu@email.com"
          rules={{ required: "Email é obrigatório" }}
          label="Email"
          name="email"
        />

        <ControlledInput
          id="password"
          control={control}
          type="password"
          autoComplete="current-password"
          placeholder="********"
          rules={{ required: "Senha é obrigatória" }}
          label="Senha"
          name="password"
        />
      </div>
      <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Carregando..." : "Entrar"}
      </Button>
    </form>
  );
}
