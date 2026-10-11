import { apiRequest } from "../api/apiClient.js";
import { getMockRoomSchedule, searchMockAvailability } from "./mockRoomPlanningService.js";
import { roomsService } from "./roomsService.js";
import { mapBooking } from "./apiModels.js";

const useMockServices = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true";

async function searchAvailabilityFromApi(criteria) {
    const rooms = (await roomsService.getRooms()).filter((room) => room.active !== false &&
        (!criteria.minimumCapacity || room.capacity >= criteria.minimumCapacity) &&
        criteria.requiredAmenities.every((amenity) => room.amenities.includes(amenity)));
    const results = await Promise.all(rooms.map(async (room) => {
        try {
            const query = new URLSearchParams({ start_time: criteria.startTime, end_time: criteria.endTime });
            const availability = await apiRequest(`/rooms/${encodeURIComponent(room.id)}/availability?${query}`);
            return availability.available ? room : null;
        }
        catch (error) {
            if (error?.status === 409 || error?.status === 404) return null;
            throw error;
        }
    }));
    return results.filter(Boolean);
}

async function getRoomScheduleFromApi(roomId, date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const query = new URLSearchParams({ start_time: start.toISOString(), end_time: end.toISOString() });
    const bookings = await apiRequest(`/rooms/${encodeURIComponent(roomId)}/schedule?${query}`);
    if (!Array.isArray(bookings)) throw new Error("The room schedule API returned an unexpected response.");
    return bookings.map((booking) => mapBooking(booking));
}

export const roomPlanningService = useMockServices
    ? { searchAvailability: searchMockAvailability, getRoomSchedule: getMockRoomSchedule }
    : { searchAvailability: searchAvailabilityFromApi, getRoomSchedule: getRoomScheduleFromApi };
