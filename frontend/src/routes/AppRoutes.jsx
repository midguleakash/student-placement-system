
import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";

import Login from "../pages/auth/Login";
import StudentRegister from "../pages/auth/StudentRegister";
import CompanyRegister from "../pages/auth/CompanyRegister";

// import Jobs from "../pages/jobs/Jobs";
// import JobDetails from "../pages/jobs/JobDetails";

import StudentDashboard from "../pages/student/StudentDashboard";
// import Profile from "../pages/student/Profile";
// import Applications from "../pages/student/Applications";
// import Interviews from "../pages/student/Interviews";

import CompanyDashboard from "../pages/company/CompanyDashboard";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>

            {/* Public Pages */}


            {/* Home is accessible only when logged out */}
            <Route element={<ProtectedRoute guestOnly />}>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/student/register"
                    element={<StudentRegister />}
                />

                <Route
                    path="/company/register"
                    element={<CompanyRegister />}
                />
            </Route>


            {/* All routes below require login */}

            <Route element={<ProtectedRoute />}>

                {/* <Route
                    path="/jobs"
                    element={<Jobs />}
                />

                <Route
                    path="/jobs/:id"
                    element={<JobDetails />}
                /> */}

                {/* Student Pages */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["STUDENT"]} />
                    }
                >
                    <Route
                        path="/student/dashboard"
                        element={<StudentDashboard />}
                    />

                    {/* <Route
                        path="/student/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/student/applications"
                        element={<Applications />}
                    />

                    <Route
                        path="/student/interviews"
                        element={<Interviews />}
                    /> */}
                </Route>

                {/* Company Pages */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["COMPANY"]} />
                    }
                >
                    <Route
                        path="/company/dashboard"
                        element={<CompanyDashboard />}
                    />
                </Route>

                {/* Admin Pages */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} />
                    }
                >
                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />
                </Route>

            </Route>

        </Routes>
    );
}

export default AppRoutes;
