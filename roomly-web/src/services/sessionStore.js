const SESSION_USER_KEY = "roomly-session-user";
const SESSION_TOKEN_KEY = "roomly-session-token";

export function getSavedUser() {
    if (typeof sessionStorage === "undefined") {
        return null;
    }
    try {
        const storedUser = sessionStorage.getItem(SESSION_USER_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
    }
    catch {
        sessionStorage.removeItem(SESSION_USER_KEY);
        return null;
    }
}

export function saveUser(user) {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    return user;
}

export function saveSession(user, token) {
    saveUser(user);
    if (token) sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    return user;
}

export function getSavedToken() {
    return typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function clearSavedUser() {
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(SESSION_USER_KEY);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
}
