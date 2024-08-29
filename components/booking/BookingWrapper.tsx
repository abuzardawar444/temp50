"use client";
import { useProperty } from "@/utils/store";
import { Booking } from "@/utils/types";
import BookingCalendar from "./BookingCalendar";
import BookingContainer from "./BookingContainer";
import { useEffect } from "react";

type BookingWrapperProps = {
  propertyId: string;
  price: number;
  bookings: Booking[];
};

const BookingWrapper = ({
  propertyId,
  price,
  bookings,
}: BookingWrapperProps) => {
  useEffect(() => {
    useProperty.setState({
      propertyId,
      price,
      bookings,
    });
  }, []);
  return (
    <>
      <BookingCalendar />
      <BookingContainer />
    </>
  );
};

export default BookingWrapper;

// BookingContainer first rendered accesses state directly via useProperty which is initially defined value , when BookingWrapper renders (only on first mount) useEffect trigger setState to change the state and this state change is broadcast to any component subscribe to useProperty to get re rendered. As the result  BookingContainer finally runs twice.

// Initial Render:
// When BookingContainer first renders, it accesses the initial state from useProperty, which contains the initial values (before any updates from BookingWrapper).

// State Update:
// When BookingWrapper mounts, it triggers the useEffect hook, which calls useProperty.setState() to update the state with new values (propertyId, price, bookings).

// Re-rendering:
// The state update causes a re-render of any components subscribed to useProperty, including BookingContainer. This is why BookingContainer logs the initial state first and then the updated state after the useEffect has executed.
// To Recap:
// First Render: BookingContainer gets the initial state.
// State Update: Triggered by useEffect in BookingWrapper.
// Re-render: BookingContainer reflects the updated state and logs it again.
