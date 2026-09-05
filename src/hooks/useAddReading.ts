import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

type AddReadingInput = {
  meterId: string;
  plantId: string;
  category: string;
  value: number;
  note?: string;
  recordedAt: string; // ISO string — caller decides the correct timestamp
};

export function useAddReading() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({
      meterId,
      value,
      note,
      recordedAt,
    }: AddReadingInput) => {
      const { data, error } = await supabase
        .from("Reading")
        .insert({
          meterId,
          value,
          note: note || null,
          recordedAt,
          recordedBy: session!.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["readingHistory", variables.meterId],
      });
      queryClient.invalidateQueries({
        queryKey: ["categorySummary", variables.plantId, variables.category],
      });
    },
  });
}
