"use client";

import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/domains/users/actions";
import { UpdateUser, User } from "@/domains/users/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { roleOptions } from "../components/form-helpers";

interface UpdateUserFormProps {
  user: User;
  onSuccess?: () => void;
}

export function UpdateUserForm({ user, onSuccess }: UpdateUserFormProps) {
  const { data: session } = useSession();
  const isCurrentUser = session?.user.id === user.id;
  const { control, handleSubmit } = useForm<UpdateUser>({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
    },
  });

  const { mutateAsync, isPending } = useServerAction({
    mutationFn: (values: UpdateUser) => {
      const { password, ...data } = values;
      const body: UpdateUser = {
        ...data,
        ...(password ? { password } : {}),
      };
      return updateUser(user.id, body);
    },
    successMessage: "Usuário atualizado com sucesso.",
    onSuccess: async () => onSuccess?.(),
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
        disabled={isCurrentUser}
        rules={{ required: "Perfil é obrigatório." }}
        className="w-full"
      />

      <ControlledInput
        control={control}
        name="password"
        label="Nova senha"
        placeholder="Deixe em branco para manter a senha atual"
        type="password"
        autoComplete="new-password"
        rules={{
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
        Salvar alterações
      </Button>
    </form>
  );
}
