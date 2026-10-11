import { apiRequest } from "../api/apiClient.js";
import { getMockAdminAmenities, getMockAdminRooms, getMockUtilizationReport, saveMockAmenity, saveMockRoom } from "./mockAdminService.js";
import { calculateUtilizationRows } from "../utils/utilization.js";
import { fetchAllPages, mapBooking, mapRoom } from "./apiModels.js";

const useMockServices = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true";

async function getRoomsFromApi() {
    const rooms = await fetchAllPages((page, limit) => apiRequest(`/rooms?page=${page}&limit=${limit}`));
    return rooms.map(mapRoom);
}

async function getAmenitiesFromApi() {
    return fetchAllPages((page, limit) => apiRequest(`/amenities?page=${page}&limit=${limit}`));
}

async function saveRoomWithApi(details) {
    const body = { name: details.name, capacity: details.capacity, location: details.location };
    const room = details.id
        ? await apiRequest(`/rooms/${encodeURIComponent(details.id)}`, { method: "PUT", body: JSON.stringify(body) })
        : await apiRequest("/rooms", { method: "POST", body: JSON.stringify(body) });

    if (details.id) {
        const existing = await apiRequest(`/rooms/${encodeURIComponent(details.id)}`);
        if (Boolean(existing.is_active) !== Boolean(details.active)) {
            await apiRequest(`/rooms/${encodeURIComponent(details.id)}/status`, {
                method: "PATCH", body: JSON.stringify({ is_active: Boolean(details.active) }),
            });
        }
    }

    const allAmenities = await getAmenitiesFromApi();
    const amenityIds = new Map(allAmenities.map((amenity) => [amenity.name, amenity.id]));
    const current = details.id ? await apiRequest(`/rooms/${encodeURIComponent(details.id)}/amenities`) : [];
    const currentIds = new Set(current.map((item) => String(item.id)));
    const selectedIds = new Set((details.amenities || []).map((name) => amenityIds.get(name)).filter(Boolean).map(String));
    const roomId = room.id ?? details.id;
    const operations = [];
    for (const id of selectedIds) {
        if (!currentIds.has(id)) operations.push(apiRequest(`/rooms/${roomId}/amenities/${id}`, { method: "POST" }));
    }
    for (const id of currentIds) {
        if (!selectedIds.has(id)) operations.push(apiRequest(`/rooms/${roomId}/amenities/${id}`, { method: "DELETE" }));
    }
    await Promise.all(operations);
    return mapRoom({ ...room, is_active: details.active, amenities: (details.amenities || []).map((name) => ({ name })) });
}

async function saveAmenityWithApi(details) {
    const body = { name: details.name, description: details.description || null };
    return details.id
        ? apiRequest(`/amenities/${encodeURIComponent(details.id)}`, { method: "PUT", body: JSON.stringify(body) })
        : apiRequest("/amenities", { method: "POST", body: JSON.stringify(body) });
}

async function getUtilizationReportFromApi(dateRange) {
    const [rooms, bookings] = await Promise.all([
        getRoomsFromApi(),
        fetchAllPages((page, limit) => apiRequest(`/bookings?page=${page}&limit=${limit}`)),
    ]);
    const mappedBookings = bookings.map((booking) => mapBooking(booking));
    return calculateUtilizationRows(rooms, mappedBookings, dateRange);
}

export const adminService = useMockServices
    ? {
        getRooms: getMockAdminRooms,
        saveRoom: saveMockRoom,
        getAmenities: getMockAdminAmenities,
        saveAmenity: saveMockAmenity,
        getUtilizationReport: getMockUtilizationReport,
    }
    : {
        getRooms: getRoomsFromApi,
        saveRoom: saveRoomWithApi,
        getAmenities: getAmenitiesFromApi,
        saveAmenity: saveAmenityWithApi,
        getUtilizationReport: getUtilizationReportFromApi,
    };
