import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Profile")
        .select("*, plants:UserPlant(plantId)")
        .order("email");

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
