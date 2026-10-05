import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";

import Login from "../pages/auth/Login";
import StudentRegister from "../pages/auth/StudentRegister";
import CompanyRegister from "../pages/auth/CompanyRegister";

// import Jobs from "../pages/jobs/Jobs";
// import JobDetails from "../pages/jobs/JobDetails";

// import StudentDashboard from "../pages/student/StudentDashboard";
// import Profile from "../pages/student/Profile";
// import Applications from "../pages/student/Applications";
// import Interviews from "../pages/student/Interviews";

// import CompanyDashboard from "../pages/company/CompanyDashboard";

// import AdminDashboard from "../pages/admin/AdminDashboard";

function AppRoutes() {
    return (
        <Routes>

            {/* Public Pages */}

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
{/* 
            <Route
                path="/company/register"
                element={<CompanyRegister />}
            /> */}


            {/* <Route
                path="/jobs"
                element={<Jobs />}
            />

            <Route
                path="/jobs/:id"
                element={<JobDetails />}
            /> */}


            {/* Student Pages */}

            {/* <Route
                path="/student/dashboard"
                element={<StudentDashboard />}
            /> */}

            {/* <Route
                path="/student/profile"
                element={<Profile />}
            />

            <Route
                path="/student/applications"
                element={<Applications />}
            /> */}

            {/* <Route
                path="/student/interviews"
                element={<Interviews />}
            /> */}


            {/* Company Pages */}
{/* 
            <Route
                path="/company/dashboard"
                element={<CompanyDashboard />}
            /> */}


            {/* Admin Pages */}

            {/* <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
            /> */}

        </Routes>
    );
}

export default AppRoutes;