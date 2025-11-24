import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const DashboardSectionOne = () => {
  const Default_Year: number = 2025;
  const Default_Date: number = 20;
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(Default_Year, 0, Default_Date),
    to: addDays(new Date(Default_Year, 0, Default_Date), Default_Date),
  });
  if (!date) {
    return null;
  }
  return (
    <section className="flex items-center justify-between">
      <h1 className="font-semibold text-lg lg:text-xl">DashBoard</h1>
      <div>
        <div className={cn("grid gap-2 py-3")}>
          <Popover>
            <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            id="date"
            type="button"
            variant={"outline"}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={date?.from}
            initialFocus
            mode="range"
            numberOfMonths={2}
            onSelect={setDate}
            selected={date}
          />
          </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  );
};

export default DashboardSectionOne;
