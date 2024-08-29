"use client";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { useProperty } from "@/utils/store";

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from "@/utils/calendar";

const BookingCalendar = () => {
  const currentDate = new Date();

  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  const bookings = useProperty((state) => state.bookings);

  // create blocked periods [{from:'date', to:'date'},{from:'date', to:'date'},{from:'date', to:'date'},]
  // which are 1) booking dates and 2) {from:1 Jan 1970, to: 'yesterday'}
  // DateRange[{},{},{}]
  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });
  const { toast } = useToast();
  const unavailableDates = generateDisabledDates(blockedPeriods);

  useEffect(() => {
    const selectedRange = generateDateRange(range);

    if (selectedRange.some((date) => unavailableDates[date])) {
      setRange(defaultSelected);
      toast({
        description: "Some dates are booked. Please select again.",
      });
    }

    // const isDisabledDateIncluded = selectedRange.some((date) => {
    //   if (unavailableDates[date]) {
    //     setRange(defaultSelected);
    //     toast({
    //       description: "Some dates are booked. Please select again.",
    //     });
    //     return true;
    //   }
    //   return false;
    // });
    useProperty.setState({ range });
  }, [range]);

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
      disabled={blockedPeriods}
    />
  );
};

export default BookingCalendar;