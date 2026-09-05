import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type MeterSummary = {
  meter_id: string;
  meter_name: string;
  unit: string;
  current_reading: number | null;
  current_reading_at: string | null;
  prior_reading: number | null;
  consumption: number | null;
};

export function useCategorySummary(
  plantId: string,
  category: string,
  monthDate: Date,
) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    1,
  );

  return useQuery({
    queryKey: ["categorySummary", plantId, category, monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_meter_monthly_summary", {
        p_plant_id: plantId,
        p_category: category,
        p_month_start: monthStart.toISOString(),
        p_month_end: monthEnd.toISOString(),
      });

      if (error) throw error;
      return data as MeterSummary[];
    },
    enabled: !!plantId && !!category,
    staleTime: 2 * 60 * 1000, // readings change more often than plant/role data, so a shorter window
  });
}
