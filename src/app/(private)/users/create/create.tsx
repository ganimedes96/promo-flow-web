"use client";

import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { Button } from "@/components/ui/button";
import { Role } from "@/domains/auth/enums";
import { createUser } from "@/domains/users/actions";
import { CreateUser, User } from "@/domains/users/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useForm } from "react-hook-form";
import { roleOptions } from "../components/form-helpers";

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { control, handleSubmit } = useForm<CreateUser>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: Role.member,
    },
  });

  const { mutateAsync, isPending } = useServerAction<User, CreateUser>({
    mutationFn: createUser,
    successMessage: "Usuário cadastrado com sucesso.",
    onSuccess: () => onSuccess?.(),
    invalidateQueries: [queryKeys.users.all],
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutateAsync(values))}
      className="flex flex-col gap-5 pb-4"
    >
      <ControlledInput
        control={control}
        name="name"
        label="Nome"
        placeholder="Nome completo"
        autoComplete="name"
        rules={{ required: "Nome é obrigatório." }}
      />

      <ControlledInput
        control={control}
        name="email"
        label="E-mail"
        placeholder="usuario@empresa.com"
        type="email"
        autoComplete="email"
        rules={{ required: "E-mail é obrigatório." }}
      />

      <ControlledInput
        control={control}
        name="phone"
        label="Telefone"
        placeholder="(00) 00000-0000"
        maskType="phoneMobile"
        inputMode="tel"
        autoComplete="tel"
        rules={{
          required: "Telefone é obrigatório.",
          minLength: { value: 11, message: "Informe um telefone válido." },
        }}
      />

      <ControlledSelect
        control={control}
        name="role"
        label="Perfil de usuário"
        placeholder="Selecione o perfil"
        options={roleOptions}
        rules={{ required: "Perfil é obrigatório." }}
        className="w-full"
      />

      <ControlledInput
        control={control}
        name="password"
        label="Senha"
        placeholder="••••••••"
        type="password"
        autoComplete="new-password"
        rules={{
          required: "Senha é obrigatória.",
          minLength: {
            value: 6,
            message: "A senha deve ter pelo menos 6 caracteres.",
          },
        }}
      />

      <Button
        type="submit"
        className="mt-2 w-full"
        loading={isPending}
        disabled={isPending}
      >
        Cadastrar usuário
      </Button>
    </form>
  );
}
