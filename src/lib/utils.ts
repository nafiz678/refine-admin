import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StoreFormValues, StoreRow } from "./type";
import { defaultFormValues } from "@/pages/stores/components/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (str: string) => {
  const date = new Date(str + "Z");
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// store utils functions

export function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function toFormValues(store?: StoreRow | null): StoreFormValues {
  if (!store) return defaultFormValues;

  return {
    store_name: store.store_name ?? "",
    store_type: store.store_type,
    city: store.city ?? "",
    area: store.area ?? "",
    address: store.address ?? "",
    contact_no: store.contact_no ?? "",
    google_map_url: store.google_map_url ?? "",
    facebook_page_url: store.facebook_page_url ?? "",
    image: store.image ?? "",
    is_active: store.is_active,
  };
}

export function toPayload(values: StoreFormValues) {
  return {
    store_name: values.store_name.trim(),
    store_type: values.store_type,
    city: nullable(values.city),
    area: nullable(values.area),
    address: values.address.trim(),
    contact_no: values.contact_no.trim(),
    google_map_url: values.google_map_url.trim(),
    facebook_page_url: nullable(values.facebook_page_url),
    image: nullable(values.image),
    is_active: values.is_active,
    updated_at: new Date().toISOString(),
  };
}
