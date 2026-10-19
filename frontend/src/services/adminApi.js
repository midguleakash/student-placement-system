
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
    getStudentStats() {
        return request("/api/admin/students/stats");
    },

    getCompanyStats() {
        return request("/api/admin/companies/stats");
    },

    async getDashboardStats() {
        const [students, companies] = await Promise.all([
            this.getStudentStats(),
            this.getCompanyStats(),
        ]);

        return { students, companies };
    },

    getPendingStudents() {
        return request("/api/admin/students/pending");
    },

    getPendingCompanies() {
        return request("/api/admin/companies/pending");
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

    approveCompany(id) {
        return request(`/api/admin/companies/${id}/approve`, {
            method: "PATCH",
        });
    },

    rejectCompany(id, remarks) {
        return request(`/api/admin/companies/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ remarks }),
        });
    },

    getAllStudents() {
        return request("/api/admin/students");
    },


    getAllCompanies() {
        return request("/api/admin/companies");
    },


    async getStudentResume(id) {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/api/admin/students/${id}/resume/view`,
            {
                headers: {
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
                cache: "no-store",
            }
        );

        if (response.status === 401) {
            logout();
            throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
            const message = await response.text();
            throw new Error(
                message || `Unable to load resume: ${response.status}`
            );
        }

        return response.blob();
    },


    getPendingPlacementRegistrations() {
        return request(
            "/api/admin/students/placement-registrations/pending"
        );
    },

    approvePlacementRegistration(profileId) {
        return request(
            `/api/admin/students/${profileId}/placement-registration/approve`,
            { method: "PATCH" }
        );
    },

    rejectPlacementRegistration(profileId, remarks) {
        return request(
            `/api/admin/students/${profileId}/placement-registration/reject`,
            {
                method: "PATCH",
                body: JSON.stringify({ remarks }),
            }
        );
    },

    getAllJobs() {
        return request("/api/admin/jobs");
    },

    getAllApplications() {
        return request("/api/admin/applications");
    },


};
