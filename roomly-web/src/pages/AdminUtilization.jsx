import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService.js";
import { formatDate, getLocalDateString } from "../utils/dateTime.js";
function getMonthStartDate() {
    const today = new Date();
    return getLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
}
function getMonthEndDate() {
    const today = new Date();
    return getLocalDateString(new Date(today.getFullYear(), today.getMonth() + 1, 0));
}
function AdminUtilization() {
    const [startDate, setStartDate] = useState(getMonthStartDate());
    const [endDate, setEndDate] = useState(getMonthEndDate());
    const [reportRows, setReportRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);
    const loadReport = useCallback(async (rangeStart, rangeEnd) => {
        setIsLoading(true);
        setErrorMessage("");
        setHasLoaded(false);
        try {
            const rows = await adminService.getUtilizationReport({
                startDate: rangeStart,
                endDate: rangeEnd,
            });
            setReportRows(rows);
            setHasLoaded(true);
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not load the utilization report.");
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        loadReport(getMonthStartDate(), getMonthEndDate());
    }, [loadReport]);
    async function handleSubmit(event) {
        event.preventDefault();
        if (!startDate || !endDate || startDate > endDate) {
            setHasLoaded(false);
            setErrorMessage("Choose a valid date range with an end date on or after the start date.");
            return;
        }
        await loadReport(startDate, endDate);
    }
    const totalBookedHours = reportRows.reduce((total, room) => total + room.bookedHours, 0);
    const totalBookings = reportRows.reduce((total, room) => total + room.bookingCount, 0);
    return (<section className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-violet-700">Roomly Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Room Utilization</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review booked hours and booking counts for each room.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="report-start-date" className="block text-sm font-semibold text-slate-700">Start date</label>
          <input id="report-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="report-end-date" className="block text-sm font-semibold text-slate-700">End date</label>
          <input id="report-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
        </div>
        <button type="submit" disabled={isLoading} className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60">
          {isLoading ? "Loading report..." : "Update report"}
        </button>
      </form>

      {errorMessage && (<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>)}

      {isLoading ? (<p role="status" className="text-sm text-slate-500">Loading utilization data...</p>) : hasLoaded && reportRows.length === 0 ? (<p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No rooms are available for this report.</p>) : hasLoaded ? (<div className="space-y-4">
          <p className="text-sm text-slate-600">
            {formatDate(`${startDate}T00:00:00`)} to {formatDate(`${endDate}T00:00:00`)}
            {" · "}{totalBookedHours.toFixed(1)} booked hours · {totalBookings} bookings
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Room</th>
                  <th scope="col" className="px-5 py-3">Booked hours</th>
                  <th scope="col" className="px-5 py-3">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((room) => (<tr key={room.roomId}>
                    <th scope="row" className="px-5 py-4 font-semibold text-slate-900">{room.roomName}</th>
                    <td className="px-5 py-4 text-slate-600">{room.bookedHours.toFixed(1)}</td>
                    <td className="px-5 py-4 text-slate-600">{room.bookingCount}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>) : null}
    </section>);
}
export default AdminUtilization;
