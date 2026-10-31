import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      initialData: undefined,
      retry: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnMount: true,
      refetchIntervalInBackground: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
