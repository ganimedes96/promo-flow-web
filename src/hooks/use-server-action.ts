"use client";

import { handleServerActionError } from "@/api/client";
import { HandleError } from "@/api/error";
import type { ApiResponse, ApiResponseError } from "@/api/types";
import { invalidateQuery, refetchQuery } from "@/lib/tanstack-query/methods";
import { toast } from "@/lib/toast";
import {
  type QueryKey,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

type ServerActionResult<T> = ApiResponse<T> | ApiResponseError;

interface UseServerActionProps<
  TData,
  TVariables,
  TContext = unknown,
> extends Omit<
  UseMutationOptions<ApiResponse<TData>, HandleError, TVariables, TContext>,
  "mutationFn"
> {
  mutationFn: (variables: TVariables) => Promise<ServerActionResult<TData>>;

  /** Mensagem de erro custom - É recomendado retornar a mensagem do servidor(Backend) para ações de erro */
  errorMessage?: string;

  /** Mensagem de sucesso custom - É recomendado retornar a mensagem do servidor(Backend) para ações de sucesso */
  successMessage?: string;

  /** Desabilitar toast automático de sucesso */
  disableSuccessToast?: boolean;

  /** Queries que devem ser invalidadas após uma mutação bem-sucedida */
  invalidateQueries?: readonly QueryKey[];

  /** Queries que devem ser recarregadas após uma mutação bem-sucedida */
  refetchQueries?: readonly QueryKey[];
}

export function useServerAction<TData, TVariables = void, TContext = unknown>({
  mutationFn,
  errorMessage,
  successMessage,
  disableSuccessToast,
  invalidateQueries,
  refetchQueries,
  onError,
  onSuccess,
  ...options
}: UseServerActionProps<TData, TVariables, TContext>): UseMutationResult<
  ApiResponse<TData>,
  HandleError,
  TVariables,
  TContext
> {
  return useMutation<ApiResponse<TData>, HandleError, TVariables, TContext>({
    ...options,
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      await handleServerActionError(response);
      return response as ApiResponse<TData>;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateQueries?.length) {
        await Promise.all(
          invalidateQueries.map((queryKey) => invalidateQuery(queryKey))
        );
      }
      if (refetchQueries?.length) {
        await Promise.all(
          refetchQueries.map((queryKey) => refetchQuery(queryKey))
        );
      }
      await onSuccess?.(data, variables, onMutateResult, context);
      if (!disableSuccessToast) {
        toast.success(successMessage || data.message || "Sucesso");
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      onError?.(error, variables, onMutateResult, context);
      toast.error(errorMessage || error.message);
    },
  });
}
