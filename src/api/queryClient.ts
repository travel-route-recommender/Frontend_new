import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "./client";

const retryableKinds = new Set(["network", "rate-limited", "server"]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (!isApiError(error)) return failureCount < 1;
        return retryableKinds.has(error.kind) && failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 5_000),
    },
    mutations: {
      retry: false,
    },
  },
});
