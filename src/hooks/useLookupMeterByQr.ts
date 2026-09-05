import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useLookupMeterByQr() {
  return useMutation({
    mutationFn: async (qrCode: string) => {
      // RLS does the real security work here: a User's select policy on
      // Meter only allows rows in their assigned plants, so scanning a
      // meter outside their access simply returns zero rows — no special
      // handling needed to enforce that boundary.
      const { data, error } = await supabase
        .from("Meter")
        .select("*, plant:Plant(id, name)")
        .eq("qrCode", qrCode)
        .single();

      if (error) throw new Error("Meter not found or not accessible.");
      return data;
    },
  });
}
