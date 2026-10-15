import { studentApi } from "../services/studentApi";
import { companyApi } from "../services/companyApi";

export async function redirectAfterLogin(role, navigate) {
    if (role === "STUDENT") {
        try {
            const profile = await studentApi.getMyProfile();

            switch (profile?.profileStatus) {
                case "INCOMPLETE":
                case "REJECTED":
                    navigate("/student/complete-profile", {
                        replace: true,
                    });
                    return;

                case "PENDING":
                    navigate("/student/profile-status", {
                        replace: true,
                    });
                    return;

                case "APPROVED":
                    navigate("/student/dashboard", {
                        replace: true,
                    });
                    return;

                default:
                    navigate("/student/complete-profile", {
                        replace: true,
                    });
                    return;
            }
        } catch (error) {
            if (error.status === 404) {
                navigate("/student/complete-profile", {
                    replace: true,
                });
                return;
            }

            console.error("Failed to fetch student profile:", error);

            // Do not redirect to profile completion for every API error.
            navigate("/student/dashboard", {
                replace: true,
            });
            return;
        }
    }

    if (role === "COMPANY") {
        try {
            const profile = await companyApi.getMyProfile();

            switch (profile.profileStatus) {
                case "INCOMPLETE":
                case "REJECTED":
                    navigate("/company/complete-profile", {
                        replace: true,
                    });
                    return;

                case "PENDING":
                    navigate("/company/profile-status", {
                        replace: true,
                    });
                    return;

                case "APPROVED":
                    navigate("/company/dashboard", {
                        replace: true,
                    });
                    return;

                default:
                    navigate("/company/complete-profile", {
                        replace: true,
                    });
                    return;
            }
        } catch (error) {
            if (error.status === 404) {
                navigate("/company/complete-profile", {
                    replace: true,
                });
                return;
            }

            throw error;
        }
    }

    if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
        return;
    }

    navigate("/login", { replace: true });
}