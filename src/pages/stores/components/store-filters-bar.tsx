import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortValue, StoreFilters } from "@/lib/type";
import { ALL_VALUE, storeTypes } from "./constants";

export function StoreFiltersBar({
  filters,
  setFilters,
  cities,
  areas,
  onReset,
}: {
  filters: StoreFilters;
  setFilters: React.Dispatch<React.SetStateAction<StoreFilters>>;
  cities: string[];
  areas: string[];
  onReset: () => void;
}) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Search name, city, area, address, phone..."
            className="pl-9"
          />
        </div>

        <Select
          value={filters.city}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              city: value,
              area: ALL_VALUE,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.area}
          onValueChange={(value) =>
            setFilters((current) => ({ ...current, area: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.storeType}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              storeType: value as StoreFilters["storeType"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {storeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              status: value as StoreFilters["status"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              sort: value as SortValue,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="name_desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}
