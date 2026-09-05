import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";

export function usePickAndUploadPlantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plantId: string) => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Photo library access is needed to choose an image.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) return null; // user backed out — not an error

      const asset = result.assets[0];
      const fileExt = asset.uri.split(".").pop() ?? "jpg";
      const fileName = `${plantId}/${Crypto.randomUUID()}.${fileExt}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("Plant")
        .update({ imageUrl: publicUrlData.publicUrl })
        .eq("id", plantId);

      if (updateError) throw updateError;

      return publicUrlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plants"] });
    },
  });
}
