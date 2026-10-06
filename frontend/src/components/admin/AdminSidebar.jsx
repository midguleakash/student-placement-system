import { Link } from "react-router-dom";

function AdminSidebar() {
    return (
        <aside className="admin-sidebar">

            <div className="admin-logo">
                Student<span>Placement</span>
            </div>

            <nav className="admin-menu">

                <Link to="/admin/dashboard">
                    Dashboard
                </Link>

                <Link to="/admin/students">
                    Students
                </Link>

                <Link to="/admin/companies">
                    Companies
                </Link>

                <Link to="/admin/jobs">
                    Job Openings
                </Link>

                <Link to="/admin/applications">
                    Applications
                </Link>

                <Link to="/admin/interviews">
                    Interviews
                </Link>

                <Link to="/admin/placements">
                    Placements
                </Link>

                <Link to="/admin/approvals">
                    Approvals
                </Link>

                <Link to="/admin/reports">
                    Reports
                </Link>

                <Link to="/admin/settings">
                    Settings
                </Link>

            </nav>

            <div className="admin-logout">

                <button>
                    Logout
                </button>

            </div>

        </aside>
    );
}

export default AdminSidebar;