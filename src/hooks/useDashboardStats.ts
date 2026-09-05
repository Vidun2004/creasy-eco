import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export function useDashboardStats() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      if (error) throw error;
      return data[0];
    },
    enabled: !!session,
    staleTime: 2 * 60 * 1000,
  });
}
