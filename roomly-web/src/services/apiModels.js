export function unwrapPage(response) {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    throw new Error("The API returned an unexpected list response.");
}

export async function fetchAllPages(fetchPage, pageSize = 100) {
    const items = [];
    let page = 1;
    let total = Infinity;
    while (items.length < total) {
        const response = await fetchPage(page, pageSize);
        const batch = unwrapPage(response);
        items.push(...batch);
        total = Number(response.total ?? items.length);
        if (batch.length < pageSize || batch.length === 0) break;
        page += 1;
    }
    return items;
}

export function mapRoom(room) {
    return {
        ...room,
        active: room.is_active ?? room.active ?? true,
        amenities: (room.amenities || []).map((amenity) => typeof amenity === "string" ? amenity : amenity.name),
    };
}

export function mapBooking(booking, roomById = new Map()) {
    const room = roomById.get(String(booking.room_id ?? booking.roomId));
    return {
        ...booking,
        id: String(booking.id),
        roomId: String(booking.room_id ?? booking.roomId),
        userId: String(booking.user_id ?? booking.userId),
        roomName: room?.name ?? booking.room_name ?? booking.roomName ?? "Meeting room",
        location: room?.location ?? booking.location ?? "",
        attendeeCount: booking.attendee_count ?? booking.attendeeCount,
        startTime: booking.start_time ?? booking.startTime,
        endTime: booking.end_time ?? booking.endTime,
    };
}
