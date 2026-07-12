import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useAppState() {
  return useQuery({
    queryKey: ["state"],
    queryFn: api.getState,
    refetchInterval: 60_000,
  });
}

export function useHistory(limit = 48, enabled = true) {
  return useQuery({
    queryKey: ["history", limit],
    queryFn: () => api.getHistory(limit),
    enabled,
    staleTime: 20_000,
  });
}
