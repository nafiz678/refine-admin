import { AppSupabaseClient, StoreFilters } from "@/lib/type";
import { ALL_VALUE, STORE_RESOURCE } from "./constants";

export async function fetchStoreOptions(supabase: AppSupabaseClient) {
  const { data, error } = await supabase
    .from(STORE_RESOURCE)
    .select("city, area")
    .order("city", { ascending: true });

  if (error) throw new Error(error.message);

  return {
    cities: Array.from(
      new Set((data ?? []).map((item) => item.city?.trim()).filter(Boolean)),
    ) as string[],
    areas: Array.from(
      new Set((data ?? []).map((item) => item.area?.trim()).filter(Boolean)),
    ) as string[],
  };
}

export async function fetchStores({
  supabase,
  filters,
  page,
  pageSize,
}: {
  supabase: AppSupabaseClient;
  filters: StoreFilters;
  page: number;
  pageSize: number;
}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  function escapeSearch(value: string) {
    return value
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_")
      .replaceAll(",", "\\,");
  }
  const search = escapeSearch(filters.search.trim());

  let request = supabase
    .from(STORE_RESOURCE)
    .select("*", { count: "exact" })
    .range(from, to);

  if (search) {
    request = request.or(
      `store_name.ilike.%${search}%,city.ilike.%${search}%,area.ilike.%${search}%,address.ilike.%${search}%,contact_no.ilike.%${search}%`,
    );
  }

  if (filters.city !== ALL_VALUE) request = request.eq("city", filters.city);
  if (filters.area !== ALL_VALUE) request = request.eq("area", filters.area);

  if (filters.storeType !== ALL_VALUE) {
    request = request.eq("store_type", filters.storeType);
  }

  if (filters.status === "active") request = request.eq("is_active", true);
  if (filters.status === "inactive") request = request.eq("is_active", false);

  if (filters.sort === "name_asc") {
    request = request.order("store_name", { ascending: true });
  } else if (filters.sort === "name_desc") {
    request = request.order("store_name", { ascending: false });
  } else if (filters.sort === "oldest") {
    request = request.order("created_at", {
      ascending: true,
      nullsFirst: false,
    });
  } else {
    request = request.order("created_at", {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, error, count } = await request;

  if (error) throw new Error(error.message);

  return {
    rows: data ?? [],
    total: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
