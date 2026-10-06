import StudentSidebar from "../../components/student/StudentSidebar";
import StudentHeader from "../../components/student/StudentHeader";
import StudentStats from "../../components/student/StudentStats";
import ProfileProgress from "../../components/student/ProfileProgress";
import RecentJobs from "../../components/student/RecentJobs";
import RecentApplications from "../../components/student/RecentApplications";

import "../../components/student/StudentDashboard.css";

function StudentDashboard() {
    return (
        <div className="student-dashboard">

            <StudentSidebar />

            <div className="student-main">

                <StudentHeader />

                <div className="student-content">

                    <div className="student-welcome">
                        <h1>Welcome, Akash</h1>

                        <p>
                            Manage your profile, jobs, applications and interviews.
                        </p>
                    </div>

                    <StudentStats />

                    <ProfileProgress />

                    <div className="student-dashboard-grid">

                        <RecentJobs />

                        <RecentApplications />

                    </div>

                </div>

            </div>

        </div>
    );
}

export default StudentDashboard;