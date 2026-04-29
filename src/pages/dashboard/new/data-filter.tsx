import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DashboardRange = {
  from: string;
  to: string;
};

function parseDashboardDate(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date());
}

export function DashboardDateRangeFilter({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (value: DashboardRange) => void;
}) {
  const parsedRange: DateRange = {
    from: parseDashboardDate(value.from),
    to: parseDashboardDate(value.to),
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-w-[260px] justify-start rounded-xl text-left font-normal"
        >
          <CalendarIcon className="mr-2 size-4" />
          {format(parsedRange.from!, "LLL dd, y")} -{" "}
          {format(parsedRange.to!, "LLL dd, y")}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={parsedRange}
          defaultMonth={parsedRange.from}
          onSelect={(range) => {
            if (!range?.from || !range?.to) return;

            onChange({
              from: format(range.from, "yyyy-MM-dd"),
              to: format(range.to, "yyyy-MM-dd"),
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
