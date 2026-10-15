
import { logout } from "../utils/auth";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Handle expired or invalid authentication
async function handleUnauthorized(response) {
    if (response.status === 401) {
        logout();

        throw new Error(
            "Your session has expired. Please log in again."
        );
    }
}

// Common error handler
async function handleResponseError(response, defaultMessage) {
    await handleUnauthorized(response);

    const message = await response.text();

    const error = new Error(
        message || `${defaultMessage}: ${response.status}`
    );

    error.status = response.status;
    throw error;
}

// JSON API requests
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
        await handleResponseError(response, "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Multipart file uploads
async function uploadFileRequest(url, file) {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        await handleResponseError(response, "Upload failed");
    }

    return response.json();
}

// Private PDF requests
async function getPdfRequest(url) {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        await handleResponseError(response, "Request failed");
    }

    return response.blob();
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

    uploadResume(file) {
        return uploadFileRequest(
            "/api/student/profile/resume",
            file
        );
    },

    getMyResume() {
        return getPdfRequest(
            "/api/student/profile/resume/view"
        );
    },
};
