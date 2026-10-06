import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStats from "../../components/admin/AdminStats";
import PendingApprovals from "../../components/admin/PendingApprovals";
import RecentJobs from "../../components/admin/RecentJobs";
import RecentApplications from "../../components/admin/RecentApplications";

import "../../components/admin/AdminDashboard.css";

function AdminDashboard() {
    return (
        <div className="admin-dashboard">

            <AdminSidebar />

            <div className="admin-main">

                <AdminHeader />

                <div className="admin-content">

                    <div className="admin-welcome">
                        <h1>Welcome, Admin</h1>
                        <p>
                            Manage students, companies, jobs and the
                            complete placement process.
                        </p>
                    </div>

                    <AdminStats />

                    <PendingApprovals />

                    <div className="admin-dashboard-grid">

                        <RecentJobs />

                        <RecentApplications />

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;