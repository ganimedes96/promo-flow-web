"use client";

import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ActionDelete } from "@/components/action-delete";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { deleteUser } from "@/domains/users/actions";
import { getUsers } from "@/domains/users/client";
import { User } from "@/domains/users/types";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { CreateUserForm } from "../form/create";
import { UpdateUserForm } from "../form/update";
import { columns } from "./helpers";

export function UsersTable() {
  const { data: session } = useSession();
  const {
    items: users,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    total,
    currentTotal,
  } = usePaginatedList<User>({
    queryKey: queryKeys.users.list(),
    queryFn: ({ page }) => getUsers({ page }),
  });

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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Não foi possível carregar os usuários. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && total > 0 && (
          <p className="text-muted-foreground mb-3 text-sm">
            {currentTotal} de {total} usuários carregados
            {isRefetching && !isFetchingNextPage ? " · Atualizando..." : ""}
          </p>
        )}

        {!isLoading && !error && !users.length && (
          <EmptyStateCard
            icon={UserPlus}
            title="Ainda não há usuários nesta lista"
            description="Cadastre o primeiro usuário para começar a organizar os acessos."
            action={<CreateUserButton />}
          />
        )}
        <div
          hidden={
            (!isLoading && !error && !users.length) ||
            (!!error && !users.length)
          }
        >
          <DataTable
            data={users}
            columns={columns}
            loading={isLoading}
            getRowKey={(user) => user.id}
            emptyMessage="Nenhum usuário cadastrado."
            infiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
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
