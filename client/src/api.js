import { getToken } from "./auth";

const API_URL = "http://localhost:5000";

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const err = (data && (data.error || data.message)) || res.statusText;
        throw new Error(err);
    }

    return data;
}

export default apiFetch;
