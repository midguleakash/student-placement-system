
import { useLocation } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { useStudentProfile } from "../../context/StudentProfileContext";

function StudentHeader() {
    const location = useLocation();
    const { profile } = useStudentProfile();

    const titles = {
        "/student/dashboard": "Dashboard",
        "/student/profile": "My Profile",
        "/student/complete-profile": "Complete Profile",
        "/student/jobs": "Job Openings",
        "/student/applications": "My Applications",
    };

    const title = titles[location.pathname] || "Student Portal";

    return (
        <header className="student-header">
            <div>
                <span className="header-eyebrow">STUDENT WORKSPACE</span>
                <h2>{title}</h2>
            </div>

            <div className="header-right">
                <StatusBadge
                    status={profile?.profileStatus || "INCOMPLETE"}
                />
                <div className="header-avatar">
                    {(profile?.firstName?.[0] || "S").toUpperCase()}
                </div>
            </div>
        </header>
    );
}

export default StudentHeader;
