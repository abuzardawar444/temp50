"use client";

import LoadingTable from "@/components/booking/LoadingTable";
import { fetchBookings } from "@/utils/actions";

const loading = () => {
  return (
    <div className="mt-16">
      <LoadingTable rows={5} />
    </div>
  );
};

export default loading;
