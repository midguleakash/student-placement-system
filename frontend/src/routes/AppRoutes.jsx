
import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";

import Login from "../pages/auth/Login";
import StudentRegister from "../pages/auth/StudentRegister";
import CompanyRegister from "../pages/auth/CompanyRegister";

import StudentLayout from "../layouts/StudentLayout";
import CompanyLayout from "../layouts/CompanyLayout";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";
import StudentJobs from "../pages/student/StudentJobs";
import StudentApplications from "../pages/student/StudentApplications";

import CompanyDashboard from "../pages/company/CompanyDashboard";
import CompanyProfile from "../pages/company/CompanyProfile";
import CompanyJobs from "../pages/company/CompanyJobs";
import CompanyApplications from "../pages/company/CompanyApplications";
import CompanyJobForm from "../pages/company/CompanyJobForm";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminCompanies from "../pages/admin/AdminCompanies";
import AdminJobs from "../pages/admin/AdminJobs";

import PlacementRegistration from "../pages/student/PlacementRegistration";
import AdminPlacementRegistrations from "../pages/admin/AdminPlacementRegistrations";



import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            {/* Public pages: guests only */}
            <Route element={<ProtectedRoute guestOnly />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/student/register"
                    element={<StudentRegister />}
                />

                <Route
                    path="/company/register"
                    element={<CompanyRegister />}
                />
            </Route>

            {/* All authenticated pages */}
            <Route element={<ProtectedRoute />}>
                {/* Student pages */}
                <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
                    <Route path="/student" element={<StudentLayout />}>
                        <Route index element={<StudentDashboard />} />

                        <Route path="dashboard" element={<StudentDashboard />} />

                        <Route path="profile" element={<StudentProfile />} />

                        <Route
                            path="complete-profile"
                            element={<StudentProfile />}
                        />

                        <Route
                            path="profile-status"
                            element={<StudentDashboard />}
                        />

                        <Route
                            path="placement-registration"
                            element={<PlacementRegistration />}
                        />

                        <Route path="jobs" element={<StudentJobs />} />

                        <Route
                            path="applications"
                            element={<StudentApplications />}
                        />


                    </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["COMPANY"]} />}>
                    <Route path="/company" element={<CompanyLayout />}>

                        <Route
                            index
                            element={<CompanyDashboard />}
                        />

                        <Route
                            path="dashboard"
                            element={<CompanyDashboard />}
                        />

                        <Route
                            path="profile"
                            element={<CompanyProfile />}
                        />

                        {/* Incomplete or rejected company */}
                        <Route
                            path="complete-profile"
                            element={<CompanyProfile />}
                        />

                        {/* Pending approval */}
                        <Route
                            path="profile-status"
                            element={<CompanyDashboard />}
                        />

                        {/* Available after approval */}
                        <Route path="jobs" element={<CompanyJobs />} />
                        <Route path="jobs/new" element={<CompanyJobForm />} />
                        <Route path="jobs/:jobId/edit" element={<CompanyJobForm />} />

                        <Route
                            path="applications"
                            element={<CompanyApplications />}
                        />

                    </Route>
                </Route>

                {/* Admin pages */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />

                        <Route
                            path="dashboard"
                            element={<AdminDashboard />}
                        />
                        <Route path="students" element={<AdminStudents />} />
                        <Route path="companies" element={<AdminCompanies />} />
                        <Route
                            path="placement-registrations"
                            element={<AdminPlacementRegistrations />}
                        />
                        <Route path="jobs" element={<AdminJobs />} />

                        {/* Add these pages as you implement them */}
                        {/* <Route path="students" element={<AdminStudents />} /> */}
                        {/* <Route path="companies" element={<AdminCompanies />} /> */}
                        {/* <Route path="jobs" element={<AdminJobs />} /> */}
                        {/* <Route path="applications" element={<AdminApplications />} /> */}
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
}

export default AppRoutes;
