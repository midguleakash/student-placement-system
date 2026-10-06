import { Link } from "react-router-dom";

function StudentSidebar() {
    return (
        <aside className="student-sidebar">

            <div className="student-logo">
                Student<span>Placement</span>
            </div>

            <nav className="student-menu">

                <Link to="/student/dashboard">
                    Dashboard
                </Link>

                <Link to="/student/profile">
                    My Profile
                </Link>

                <Link to="/jobs">
                    Job Openings
                </Link>

                <Link to="/student/applications">
                    My Applications
                </Link>

                <Link to="/student/interviews">
                    Interviews
                </Link>

                <Link to="/student/resume">
                    My Resume
                </Link>

                <Link to="/student/placement">
                    Placement Status
                </Link>

                <Link to="/student/settings">
                    Settings
                </Link>

            </nav>

            <div className="student-logout">
                <button>
                    Logout
                </button>
            </div>

        </aside>
    );
}

export default StudentSidebar;