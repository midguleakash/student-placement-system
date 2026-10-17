
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
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // Handle expired or invalid token
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


export const companyApi = {
    getMyProfile() {
        return request("/api/company/profile/me");
    },

    saveProfile(profile) {
        return request("/api/company/profile/me", {
            method: "PUT",
            body: JSON.stringify(profile),
        });
    },

    submitProfile() {
        return request("/api/company/profile/submit", {
            method: "POST",
        });
    },

    // Job management
    getMyJobs() {
        return request("/api/company/jobs");
    },

    getMyJob(jobId) {
        return request(`/api/company/jobs/${jobId}`);
    },

    createJob(job) {
        return request("/api/company/jobs", {
            method: "POST",
            body: JSON.stringify(job),
        });
    },

    updateJob(jobId, job) {
        return request(`/api/company/jobs/${jobId}`, {
            method: "PUT",
            body: JSON.stringify(job),
        });
    },

    publishJob(jobId) {
        return request(`/api/company/jobs/${jobId}/publish`, {
            method: "PATCH",
        });
    },

    closeJob(jobId) {
        return request(`/api/company/jobs/${jobId}/close`, {
            method: "PATCH",
        });
    },

    // Company sees applications for its own jobs
    getMyApplications() {
        return request("/api/company/applications");
    },
};
