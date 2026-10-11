import { apiRequest } from "../api/apiClient.js";
import { getMockRooms } from "./mockRoomsService.js";
import { fetchAllPages, mapRoom } from "./apiModels.js";
const useMockServices = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true";
async function getRoomsFromApi() {
    const rooms = await fetchAllPages((page, limit) => apiRequest(`/rooms?page=${page}&limit=${limit}`));
    return rooms.map(mapRoom).filter((room) => room.active !== false);
}
export const roomsService = {
    getRooms: useMockServices ? getMockRooms : getRoomsFromApi,
};
