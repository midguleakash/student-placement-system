
import { NavLink, useNavigate } from "react-router-dom";
import { useStudentProfile } from "../../context/StudentProfileContext";

function StudentSidebar() {
    const navigate = useNavigate();
    const { profile, loading } = useStudentProfile();

    const approved = profile?.profileStatus === "APPROVED";

    function logout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("userId");

        navigate("/login", { replace: true });
    }

    return (
        <aside className="student-sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">SP</div>
                <div>
                    <strong>Student Portal</strong>
                    <small>Placement System</small>
                </div>
            </div>

            <nav className="sidebar-nav">
                <p className="sidebar-label">WORKSPACE</p>

                <NavLink
                    to="/student/dashboard"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>▦</span> Dashboard
                </NavLink>

                <NavLink
                    to="/student/profile"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <span>♙</span> My Profile
                </NavLink>

                <p className="sidebar-label">PLACEMENTS</p>

                <NavLink
                    to={approved ? "/student/jobs" : "/student/profile"}
                    onClick={(event) => {
                        if (!approved) {
                            event.preventDefault();
                            navigate("/student/profile");
                        }
                    }}
                    className={({ isActive }) =>
                        `sidebar-link ${approved && isActive ? "active" : ""
                        } ${!approved ? "locked" : ""}`
                    }
                    title={
                        approved
                            ? "Browse jobs"
                            : "Available after profile approval"
                    }
                >
                    <span>▤</span>
                    Jobs
                    {!approved && <span className="lock-label">Locked</span>}
                </NavLink>

                <NavLink
                    to={approved ? "/student/applications" : "/student/profile"}
                    onClick={(event) => {
                        if (!approved) {
                            event.preventDefault();
                            navigate("/student/profile");
                        }
                    }}
                    className={({ isActive }) =>
                        `sidebar-link ${approved && isActive ? "active" : ""
                        } ${!approved ? "locked" : ""}`
                    }
                    title={
                        approved
                            ? "Track your applications"
                            : "Available after profile approval"
                    }
                >
                    <span>↗</span>
                    Applications
                    {!approved && <span className="lock-label">Locked</span>}
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-status">
                    <span className="online-dot" />
                    {loading
                        ? "Loading profile..."
                        : approved
                            ? "Placement access enabled"
                            : "Complete your profile"}
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={logout}
                >
                    ↪ Logout
                </button>
            </div>
        </aside>
    );
}

export default StudentSidebar;
