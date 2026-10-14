const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(url, options = {}) {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = new Error(
            await response.text() || `Request failed: ${response.status}`
        );
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const studentApi = {
    getMyProfile() {
        return request("/api/student/profile/me");
    },

    saveProfile(profile) {
        return request("/api/student/profile/me", {
            method: "PUT",
            body: JSON.stringify(profile),
        });
    },

    submitProfile() {
        return request("/api/student/profile/submit", {
            method: "POST",
        });
    },
};