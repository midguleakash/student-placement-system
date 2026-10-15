
import { logout } from "../utils/auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please log in again.");
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed with status ${response.status}`
        );
    }

    return data;
}

export const adminApi = {
    // Replace these paths with your actual backend endpoints.
    getDashboardStats() {
        return request("/api/admin/dashboard/stats");
    },

    getPendingApprovals() {
        return request("/api/admin/approvals");
    },

    approveStudent(id) {
        return request(`/api/admin/students/${id}/approve`, {
            method: "PATCH",
        });
    },

    rejectStudent(id, remarks) {
        return request(`/api/admin/students/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ remarks }),
        });
    },

    getCompanies() {
        return request("/api/admin/companies");
    },

    getJobs() {
        return request("/api/admin/jobs");
    },

    getApplications() {
        return request("/api/admin/applications");
    },
};
