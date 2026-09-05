import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";

export function useMeters(plantId: string, category: string) {
  return useQuery({
    queryKey: ["meters", plantId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Meter")
        .select("*")
        .eq("plantId", plantId)
        .eq("category", category)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!plantId && !!category,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMeter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plantId,
      category,
      name,
      unit,
    }: {
      plantId: string;
      category: string;
      name: string;
      unit: string;
    }) => {
      const qrCode = Crypto.randomUUID();
      const { data, error } = await supabase
        .from("Meter")
        .insert({ plantId, category, name, unit, qrCode })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["meters", data.plantId, data.category],
      });
    },
  });
}

export function useUpdateMeter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      unit,
    }: {
      id: string;
      name: string;
      unit: string;
    }) => {
      const { data, error } = await supabase
        .from("Meter")
        .update({ name, unit })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["meters", data.plantId, data.category],
      });
    },
  });
}

export function useDeleteMeter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      plantId: string;
      category: string;
    }) => {
      const { error } = await supabase.from("Meter").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["meters", variables.plantId, variables.category],
      });
    },
  });
}
