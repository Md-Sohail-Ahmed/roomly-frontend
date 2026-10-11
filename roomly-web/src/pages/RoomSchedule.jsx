import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { roomsService } from "../services/roomsService.js";
import { roomPlanningService } from "../services/roomPlanningService.js";
import { formatDate, formatTime, getLocalDateString } from "../utils/dateTime.js";
function RoomSchedule() {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());
    const [bookings, setBookings] = useState([]);
    const [isLoadingRoom, setIsLoadingRoom] = useState(true);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasLoadedSchedule, setHasLoadedSchedule] = useState(false);
    useEffect(() => {
        async function loadRoom() {
            setIsLoadingRoom(true);
            setErrorMessage("");
            try {
                const rooms = await roomsService.getRooms();
                const matchingRoom = rooms.find((item) => String(item.id) === String(roomId));
                if (!matchingRoom) {
                    setErrorMessage("That room could not be found.");
                }
                else {
                    setRoom(matchingRoom);
                }
            }
            catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "Could not load this room.");
            }
            finally {
                setIsLoadingRoom(false);
            }
        }
        loadRoom();
    }, [roomId]);
    async function handleLoadSchedule(event) {
        event.preventDefault();
        if (!selectedDate) {
            setErrorMessage("Choose a date to view the room schedule.");
            return;
        }
        setErrorMessage("");
        setHasLoadedSchedule(false);
        setIsLoadingSchedule(true);
        try {
            const schedule = await roomPlanningService.getRoomSchedule(roomId ?? "", selectedDate);
            setBookings(schedule);
            setHasLoadedSchedule(true);
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not load this schedule.");
        }
        finally {
            setIsLoadingSchedule(false);
        }
    }
    if (isLoadingRoom) {
        return <p role="status" className="text-sm text-slate-500">Loading room...</p>;
    }
    if (!room) {
        return (<section className="space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Room not found</h1>
        {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
        <Link to="/rooms" className="font-semibold text-violet-700 underline">
          Browse rooms
        </Link>
      </section>);
    }
    return (<section className="mx-auto max-w-4xl space-y-7">
      <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
        <ArrowLeft size={17} aria-hidden="true"/>
        Back to rooms
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {room.name} Schedule
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose a date to see the room’s bookings for that day.
        </p>
      </header>

      <form onSubmit={handleLoadSchedule} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="schedule-date" className="block text-sm font-semibold text-slate-700">
            Schedule date
          </label>
          <input id="schedule-date" type="date" value={selectedDate} onChange={(event) => {
            setSelectedDate(event.target.value);
            setHasLoadedSchedule(false);
            setBookings([]);
        }} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
        </div>
        <button type="submit" disabled={isLoadingSchedule} className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60">
          {isLoadingSchedule ? "Loading schedule..." : "View schedule"}
        </button>
      </form>

      {errorMessage && (<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>)}

      {hasLoadedSchedule && !isLoadingSchedule && bookings.length === 0 && (<p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No bookings are scheduled for {formatDate(`${selectedDate}T00:00:00`)}.
        </p>)}

      {hasLoadedSchedule && bookings.length > 0 && (<div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Schedule for {formatDate(`${selectedDate}T00:00:00`)}
          </h2>
          <ol className="space-y-3">
            {bookings.map((booking) => {
                return (<li key={booking.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex w-28 shrink-0 items-start gap-2 pt-1 text-sm font-semibold text-violet-700">
                    <Clock3 size={17} aria-hidden="true"/>
                    <span>
                      {formatTime(booking.startTime)}<br />
                      <span className="font-normal text-slate-500">to {formatTime(booking.endTime)}</span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">Room reserved</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={16} aria-hidden="true"/>
                        Booked
                      </span>
                    </div>
                  </div>
                </li>);
            })}
          </ol>
        </div>)}
    </section>);
}
export default RoomSchedule;
