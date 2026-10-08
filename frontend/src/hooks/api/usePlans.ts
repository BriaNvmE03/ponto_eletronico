import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetPlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/plans');
      return response.data;
    }
  });
}
