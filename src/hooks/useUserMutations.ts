import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "create", email, password, fullName },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete", userId, reason },
      });

      if (error) {
        let detail = error.message;
        try {
          const body = await error.context.json();
          if (body?.error) detail = body.error;
        } catch {
          // fall back to generic message
        }
        throw new Error(detail);
      }

      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "ADMIN" | "USER";
    }) => {
      const { error } = await supabase
        .from("Profile")
        .update({ role })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserPlants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      plantIds,
    }: {
      userId: string;
      plantIds: string[];
    }) => {
      // Simplest correct approach: wipe existing assignments, re-insert the
      // current selection. Fine at this scale — a handful of plants per user.
      const { error: deleteError } = await supabase
        .from("UserPlant")
        .delete()
        .eq("userId", userId);
      if (deleteError) throw deleteError;

      if (plantIds.length > 0) {
        const { error: insertError } = await supabase
          .from("UserPlant")
          .insert(plantIds.map((plantId) => ({ userId, plantId })));
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
