import { getApiErrorMessage } from "../utils/apiErrors.js";
import { getSavedToken } from "../services/sessionStore.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";
export class ApiError extends Error {
    status;
    requestId;
    responseBody;
    constructor(message, options = {}) {
        super(message, options.cause ? { cause: options.cause } : undefined);
        this.name = "ApiError";
        this.status = options.status ?? null;
        this.requestId = options.requestId ?? null;
        this.responseBody = options.responseBody ?? null;
    }
}
function getRequestUrl(path) {
    if (!API_BASE_URL) {
        throw new ApiError("VITE_API_BASE_URL is not configured.");
    }
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
    const relativePath = path.replace(/^\/+/, "");
    if (/^https?:\/\//i.test(baseUrl)) return new URL(relativePath, baseUrl);
    return new URL(`${baseUrl}${relativePath}`, window.location.origin);
}
async function readResponseBody(response) {
    const responseText = await response.text();
    if (!responseText) {
        return null;
    }
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("json")) {
        return responseText;
    }
    try {
        return JSON.parse(responseText);
    }
    catch (error) {
        throw new ApiError("The server returned invalid JSON.", {
            status: response.status,
            requestId: response.headers.get("X-Request-ID"),
            cause: error,
        });
    }
}
export async function apiRequest(path, options = {}) {
    if (!API_BASE_URL) {
        throw new ApiError("VITE_API_BASE_URL is not configured.");
    }
    const headers = new Headers(options.headers);
    const token = getSavedToken();
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    let response;
    try {
        response = await fetch(getRequestUrl(path), {
            credentials: "include",
            ...options,
            headers,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw error;
        }
        throw new ApiError("Could not connect to the API server.", { cause: error });
    }
    const requestId = response.headers.get("X-Request-ID");
    const responseBody = await readResponseBody(response);
    if (response.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new Event("roomly:unauthorized"));
    }
    if (!response.ok) {
        throw new ApiError(getApiErrorMessage(response.status, responseBody, requestId), { status: response.status, requestId, responseBody });
    }
    return responseBody;
}
