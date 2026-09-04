import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export function useProfile() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Profile")
        .select("*")
        .eq("id", session!.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session, // never fires without a logged-in user
    staleTime: 5 * 60 * 1000, // 5 min — role/name rarely change mid-session
  });
}
