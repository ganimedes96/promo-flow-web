"use client";

import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ActionDelete } from "@/components/action-delete";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ListPagination } from "@/components/pagination";
import { deleteUser } from "@/domains/users/actions";
import { getUsers } from "@/domains/users/client";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { CreateUserForm } from "../create/create";
import { UpdateUserForm } from "../update/update";
import { columns } from "./helpers";

export function UsersTable() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const perPage = 10;
  const list = useQuery({
    queryKey: queryKeys.users.list({ page, perPage, userId: session?.user.id }),
    queryFn: () => getUsers({ page, limit: perPage }),
    enabled: !!session?.user.id,
    placeholderData: keepPreviousData,
  });
  const users = list.data?.data ?? [];
  const total = list.data?.pagination.total ?? 0;
  const lastPage = Math.max(1, list.data?.pagination.lastPage ?? 1);
  const loading = list.isPending || list.isPlaceholderData;
  if (list.data && !list.isPlaceholderData && page > lastPage)
    setPage(Math.max(1, lastPage));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">Usuários</CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie os usuários cadastrados no tenant atual.
          </p>
        </div>

        <CreateUserButton />
      </CardHeader>

      <CardContent>
        {list.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Não foi possível carregar os usuários. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {!loading && total > 0 && (
          <p className="text-muted-foreground mb-3 text-sm">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total} usuários
            {list.isFetching ? " · Atualizando..." : ""}
          </p>
        )}

        {!loading && !list.error && !users.length && (
          <EmptyStateCard
            icon={UserPlus}
            title="Ainda não há usuários nesta lista"
            description="Cadastre o primeiro usuário para começar a organizar os acessos."
            action={<CreateUserButton />}
          />
        )}
        <div
          hidden={
            (!loading && !list.error && !users.length) ||
            (!!list.error && !users.length)
          }
        >
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            getRowKey={(user) => user.id}
            emptyMessage="Nenhum usuário cadastrado."
            actions={(user) => (
              <>
                <FormSheet
                  title="Editar usuário"
                  description="Atualize os dados e o perfil de acesso."
                  formComponent={UpdateUserForm}
                  formProps={{ user }}
                  isEdit
                />

                <ActionDelete
                  name={user.name}
                  onDelete={() => deleteUser(user.id)}
                  revalidateQueries={queryKeys.users.all}
                  disabled={session?.user.id === user.id}
                  confirmDescription={`Tem certeza que deseja excluir ${user.name}? Essa ação não poderá ser desfeita.`}
                />
              </>
            )}
          />
        </div>
        {total > 0 && (
          <div className="mt-4">
            <ListPagination
              page={page}
              totalPages={lastPage}
              onPage={setPage}
              busy={loading}
              label="Paginação dos usuários"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateUserButton() {
  return (
    <FormSheet
      title="Cadastrar usuário"
      description="Informe os dados e defina o perfil de acesso."
      buttonText="Novo usuário"
      formComponent={CreateUserForm}
      formProps={{}}
      customButton={
        <Button type="button">
          <UserPlus className="size-4" />
          Novo usuário
        </Button>
      }
    />
  );
}
