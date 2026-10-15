
import AdminStats from "../../components/admin/AdminStats";
import PendingApprovals from "../../components/admin/PendingApprovals";
import RecentJobs from "../../components/admin/RecentJobs";
import RecentApplications from "../../components/admin/RecentApplications";

export default function AdminDashboard() {
    return (
        <>
            <section className="admin-welcome">
                <div>
                    <p className="admin-eyebrow">ADMINISTRATION</p>
                    <h1>Welcome back, Admin 👋</h1>
                    <p>
                        Monitor students, companies, job openings and
                        the complete placement process.
                    </p>
                </div>

                <div className="admin-date">
                    <span>📊</span>
                    <div>
                        <strong>Placement overview</strong>
                        <small>Student Placement Management System</small>
                    </div>
                </div>
            </section>

            <AdminStats />

            <PendingApprovals />

            <div className="admin-bottom-grid">
                <RecentJobs />
                <RecentApplications />
            </div>
        </>
    );
}
