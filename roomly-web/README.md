# Roomly Web

Roomly is a meeting-room booking frontend built with React and JSX. The interface supports employee sign-in, room browsing, availability search, booking creation and history, room schedules, and admin room, amenity, and utilization screens.

## Run locally

1. Install the locked dependencies:

   ```sh
   npm ci
   ```

2. Start Vite:

   ```sh
   npm run dev
   ```

The default configuration connects to the Go backend at `http://localhost:8080` through the Vite `/api` proxy. Start the backend first. No `.env` file is required for local integration. To switch to mock accounts and in-memory demo data, set `VITE_USE_MOCK_SERVICES=true` in `.env`.

## Check the project

Run the unit tests and production build with:

```sh
npm test
npm run build
```

The tests cover booking rules and history, availability conflicts, mock account ownership, admin form validation, utilization calculations, and API error messages.

## Project structure

- `src/pages/` contains the route-level employee and admin screens.
- `src/layouts/` contains the shared page layout; the sidebar occupies its own sticky column beside the page content.
- `src/components/` contains reusable pieces such as room cards and protected-route handling.
- `src/services/` selects mock or API-backed room, booking, authentication, and admin operations.
- `src/data/` contains temporary development fixtures.
- `src/api/` centralizes HTTP requests and response errors.
- `src/utils/` contains booking validation, date formatting, availability rules, booking history, and utilization calculations.
- `docs/API-CONTRACT.md` records the frontend’s proposed API shapes and the decisions still needing agreement.

## Mock services and API integration

Vite development uses mock services by default. Set `VITE_USE_MOCK_SERVICES=false` in the local `.env` file to select the API services during development. Production builds use the API services; they do not use mock data.

The actual API routes, field mappings, authentication behavior, and unsupported backend features are documented in [docs/API-CONTRACT.md](docs/API-CONTRACT.md). JWTs are stored for the current browser tab and sent as bearer tokens. The backend makes the final decisions about permissions, booking duration, room capacity, availability, and conflicts.
