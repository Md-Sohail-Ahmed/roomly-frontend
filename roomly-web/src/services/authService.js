import { apiRequest } from "../api/apiClient.js";
import { loginWithMock, logoutMock, registerWithMock, } from "./mockAuthService.js";
import { clearSavedUser, getSavedUser, getSavedToken, saveSession, saveUser } from "./sessionStore.js";
export { clearSavedUser };
const useMockServices = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true";
function validateUserResponse(response) {
    if (!response || typeof response !== "object" || !("user" in response) || typeof response.token !== "string") {
        throw new Error("The login API must return a token and user object.");
    }
    const user = response.user;
    if (!user ||
        (typeof user.id !== "string" && typeof user.id !== "number") ||
        typeof user.email !== "string" ||
        (user.role !== "employee" && user.role !== "admin")) {
        throw new Error("The authentication API must return a user with id, email, and role.");
    }
    return { user, token: response.token };
}
async function loginWithApi(email, password) {
    const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });
    return validateUserResponse(response);
}
async function registerWithApi(name, email, password) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
    });
}
async function restoreCurrentUserFromApi() {
    return getSavedToken() ? getSavedUser() : null;
}
export function getCurrentUser() {
    return getSavedUser();
}
export async function login(email, password) {
    if (useMockServices) return saveUser(await loginWithMock(email.trim(), password));
    const { user, token } = await loginWithApi(email.trim(), password);
    return saveSession(user, token);
}
export async function registerEmployee(name, email, password) {
    if (useMockServices) return saveUser(await registerWithMock(name.trim(), email.trim(), password));
    await registerWithApi(name.trim(), email.trim(), password);
    return login(email.trim(), password);
}
export async function logout() {
    try {
        if (useMockServices) {
            await logoutMock();
        }
        else {
            // JWT sessions are stateless; clearing the local token logs out.
        }
    }
    finally {
        clearSavedUser();
    }
}
export async function restoreSession() {
    if (useMockServices) {
        return getCurrentUser();
    }
    try {
        const user = await restoreCurrentUserFromApi();
        return user ? saveUser(user) : null;
    }
    catch (error) {
        clearSavedUser();
        throw error;
    }
}
