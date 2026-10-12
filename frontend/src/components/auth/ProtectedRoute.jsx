
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getDashboardPath = (role) => {
    switch (role) {
        case "STUDENT":
            return "/student/dashboard";
        case "COMPANY":
            return "/company/dashboard";
        case "ADMIN":
            return "/admin/dashboard";
        default:
            return "/";
    }
};

const ProtectedRoute = ({ allowedRoles, guestOnly = false }) => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const location = useLocation();

    // Logged-in users cannot access guest-only pages
    if (guestOnly && token) {
        return <Navigate to={getDashboardPath(role)} replace />;
    }

    // Private pages require login
    if (!guestOnly && !token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={getDashboardPath(role)} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
