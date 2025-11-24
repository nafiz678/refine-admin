import { supabaseClient } from "@/lib";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabaseClient.from("product").select("*");
      return data || [];
    },
  });
};
