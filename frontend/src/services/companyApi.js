
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

    getMyJobs() {
        return request("/api/company/jobs");
    },

    getMyApplications() {
        return request("/api/company/applications");
    },
};
