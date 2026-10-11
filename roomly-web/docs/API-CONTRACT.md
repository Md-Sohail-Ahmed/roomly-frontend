# Roomly frontend API integration

The React client is configured for the Go API in `roomly_backend/roomly-api`. `VITE_API_BASE_URL=/api/v1` is proxied by Vite to `http://localhost:8080`, avoiding browser CORS issues during local development.

The API uses bearer JWT authentication. Login returns `{ "token": "...", "user": {...} }`; the frontend stores both in session storage and sends `Authorization: Bearer <token>` on protected requests. Registration creates an employee and the frontend logs the new account in immediately. The backend has no logout or current-user route, so logout clears the local token and session. A 401 response also clears the client session.

The frontend maps backend snake_case fields to its existing UI names. Paginated endpoints return `{ data, total, page, limit }`; the client follows pages until it has all records needed by a screen.

## Connected features

- Account registration and login: `POST /auth/register`, `POST /auth/login`.
- Browse and administer rooms: `GET /rooms`, `GET /rooms/{id}`, `POST /rooms`, `PUT /rooms/{id}`, `PATCH /rooms/{id}/status`.
- Manage amenity records and room links: `/amenities` and `/rooms/{id}/amenities/{amenityID}`.
- Availability search: calls `GET /rooms/{id}/availability` once per room and filters by capacity and amenities in the client.
- Room schedule: `GET /rooms/{id}/schedule?start_time=...&end_time=...` returns active occupied time ranges without exposing meeting titles or attendee details.
- Employee booking history and booking creation/cancellation: `/bookings/mine`, `POST /bookings`, and `POST /bookings/{id}/cancel`.
- Admin utilization: loads the admin booking list and room list, then computes booked hours and booking counts in the client.

The API remains authoritative for authentication, roles, booking duration, room capacity, and conflicts. The browser’s validation is only for faster feedback.
