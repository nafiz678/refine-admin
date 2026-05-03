import { StoreFilters, StoreFormValues, StoreType } from "@/lib/type";


export const STORE_RESOURCE = "storeInformation";
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const ALL_VALUE = "all";

export const storeTypes: StoreType[] = [
  "Prime Shop",
  "Flex Shop",
  "Niche Shop",
];

export const defaultFilters: StoreFilters = {
  search: "",
  city: ALL_VALUE,
  area: ALL_VALUE,
  storeType: ALL_VALUE,
  status: ALL_VALUE,
  sort: "newest",
};

export const defaultFormValues: StoreFormValues = {
  store_name: "",
  store_type: "Prime Shop",
  city: "",
  area: "",
  address: "",
  contact_no: "",
  google_map_url: "",
  facebook_page_url: "",
  image: "",
  is_active: true,
};
