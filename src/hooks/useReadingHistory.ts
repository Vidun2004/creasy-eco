import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useReadingHistory(
  meterId: string,
  monthStart: Date,
  monthEnd: Date,
) {
  return useQuery({
    queryKey: ["readingHistory", meterId, monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Reading")
        .select("*")
        .eq("meterId", meterId)
        .gte("recordedAt", monthStart.toISOString())
        .lt("recordedAt", monthEnd.toISOString())
        .order("recordedAt", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!meterId,
    staleTime: 60 * 1000,
  });
}
