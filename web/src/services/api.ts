import type { IApiResponse } from "../types/user";

const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new Event("unauthorized"));
            throw new Error("Session expired.");
        }
        const body = (await response.json().catch(() => ({}))) as IApiResponse<unknown>;
        throw new Error(body.message || `Request failed with status ${response.status}.`);
    }

    return response.json() as Promise<T>;
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
    post: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body?: unknown) =>
        request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    del: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};