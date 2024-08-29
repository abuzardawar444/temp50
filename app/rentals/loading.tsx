"use client";
import LoadingTable from "@/components/booking/LoadingTable";
function loading() {
  return (
    <div className="mt-16">
      <LoadingTable rows={5} />
    </div>
  );
}
export default loading;
