import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService.js";
import { validateRoomDetails } from "../utils/adminValidation.js";
function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("1");
    const [active, setActive] = useState(true);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const [roomResults, amenityResults] = await Promise.all([
                adminService.getRooms(),
                adminService.getAmenities(),
            ]);
            setRooms(roomResults);
            setAmenities(amenityResults);
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not load admin room data.");
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        loadData();
    }, [loadData]);
    function resetForm() {
        setEditingId(null);
        setName("");
        setLocation("");
        setCapacity("1");
        setActive(true);
        setSelectedAmenities([]);
        setErrorMessage("");
    }
    function editRoom(room) {
        setEditingId(room.id);
        setName(room.name);
        setLocation(room.location);
        setCapacity(String(room.capacity));
        setActive(room.active !== false);
        setSelectedAmenities([...room.amenities]);
        setStatusMessage("");
        setErrorMessage("");
    }
    function toggleAmenity(amenityName) {
        setSelectedAmenities((current) => current.includes(amenityName)
            ? current.filter((item) => item !== amenityName)
            : [...current, amenityName]);
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setStatusMessage("");
        const validationMessage = validateRoomDetails({ name, location, capacity });
        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }
        setIsSaving(true);
        try {
            await adminService.saveRoom({
                id: editingId,
                name: name.trim(),
                location: location.trim(),
                capacity: Number(capacity),
                active: editingId ? active : true,
                amenities: selectedAmenities,
            });
            await loadData();
            setStatusMessage(editingId ? "Room updated." : "Room created.");
            resetForm();
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not save this room.");
        }
        finally {
            setIsSaving(false);
        }
    }
    return (<section className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-violet-700">Roomly Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Manage Rooms</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create rooms, update their details, and manage active status and amenities.
        </p>
      </header>

      {statusMessage && <p role="status" className="text-sm text-emerald-700">{statusMessage}</p>}
      {errorMessage && (<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>)}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit room" : "Create a room"}
          </h2>
          {editingId && (<button type="button" onClick={resetForm} className="text-sm font-semibold text-slate-600 underline">
              Cancel editing
            </button>)}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="room-name" className="block text-sm font-semibold text-slate-700">Room name</label>
            <input id="room-name" type="text" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
          </div>
          <div className="space-y-2">
            <label htmlFor="room-location" className="block text-sm font-semibold text-slate-700">Location</label>
            <input id="room-location" type="text" required maxLength={80} value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
          </div>
          <div className="space-y-2">
            <label htmlFor="room-capacity" className="block text-sm font-semibold text-slate-700">Capacity</label>
            <input id="room-capacity" type="number" min="1" step="1" required value={capacity} onChange={(event) => setCapacity(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
          </div>
        </div>

        {amenities.length > 0 && (<fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Room amenities</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {amenities.map((amenity) => (<label key={amenity.id} className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={selectedAmenities.includes(amenity.name)} onChange={() => toggleAmenity(amenity.name)} className="size-4 accent-violet-600"/>
                  {amenity.name}
                </label>))}
            </div>
          </fieldset>)}

        {editingId && (<label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-violet-600"/>
            Room is active
          </label>)}

        <button type="submit" disabled={isSaving} className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60 ml-2.5">
          {isSaving ? "Saving room..." : editingId ? "Save room" : "Create room"}
        </button>
      </form>

      {isLoading ? (<p role="status" className="text-sm text-slate-500">Loading rooms...</p>) : errorMessage ? null : rooms.length === 0 ? (<p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No rooms have been added.</p>) : (<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Room</th>
                <th scope="col" className="px-5 py-3">Capacity</th>
                <th scope="col" className="px-5 py-3">Amenities</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (<tr key={room.id}>
                  <th scope="row" className="px-5 py-4 font-semibold text-slate-900">
                    {room.name}<span className="mt-1 block font-normal text-slate-500">{room.location}</span>
                  </th>
                  <td className="px-5 py-4 text-slate-600">{room.capacity}</td>
                  <td className="max-w-xs px-5 py-4 text-slate-600">{room.amenities.join(", ") || "None"}</td>
                  <td className="px-5 py-4">{room.active ? "Active" : "Inactive"}</td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => editRoom(room)} className="font-semibold text-violet-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
                      Edit
                    </button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </section>);
}
export default AdminRooms;
