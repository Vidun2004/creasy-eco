import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import { useProfile } from "./useProfile";

export function usePlants() {
  const { session } = useAuth();
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["plants", session?.user.id, profile?.role],
    queryFn: async () => {
      if (profile?.role === "ADMIN") {
        // Admins see every plant — one flat query, no join needed.
        const { data, error } = await supabase
          .from("Plant")
          .select("*")
          .order("name");

        if (error) throw error;
        return data;
      }

      // Regular users only see plants they're explicitly assigned to.
      const { data, error } = await supabase
        .from("UserPlant")
        .select("plant:Plant(*)")
        .eq("userId", session!.user.id);

      if (error) throw error;
      return data.map((row: any) => row.plant);
    },
    enabled: !!session && !!profile, // won't fire until we actually know the role
    staleTime: 5 * 60 * 1000, // plant assignments rarely change mid-session
  });
}
