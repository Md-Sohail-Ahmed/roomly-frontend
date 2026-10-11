import { apiRequest } from "../api/apiClient.js";
import { cancelMockBooking, createMockBooking, getMockMyBookings } from "./mockMyBookingsService.js";
import { fetchAllPages, mapBooking } from "./apiModels.js";
import { roomsService } from "./roomsService.js";
import { getSavedUser } from "./sessionStore.js";

const useMockServices = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true";

async function getMyBookingsFromApi() {
    const currentUser = getSavedUser();
    const isAdmin = currentUser?.role === "admin";
    const [bookings, rooms] = await Promise.all([
        fetchAllPages((page, limit) => apiRequest(`${isAdmin ? "/bookings" : "/bookings/mine"}?page=${page}&limit=${limit}`)),
        roomsService.getRooms(),
    ]);
    const roomById = new Map(rooms.map((room) => [String(room.id), room]));
    return bookings
        .filter((booking) => !isAdmin || String(booking.user_id) === String(currentUser.id))
        .map((booking) => mapBooking(booking, roomById));
}

async function cancelMyBookingFromApi(bookingId) {
    return apiRequest(`/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: "POST" });
}

async function createBookingWithApi(details) {
    const booking = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({
            room_id: Number(details.roomId),
            title: details.title,
            attendee_count: Number(details.attendeeCount),
            start_time: details.startTime,
            end_time: details.endTime,
        }),
    });
    return mapBooking(booking);
}

export const myBookingsService = useMockServices
    ? { getMyBookings: getMockMyBookings, cancelBooking: cancelMockBooking, createBooking: createMockBooking }
    : { getMyBookings: getMyBookingsFromApi, cancelBooking: cancelMyBookingFromApi, createBooking: createBookingWithApi };
