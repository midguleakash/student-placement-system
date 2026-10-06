import { Link } from "react-router-dom";

function CompanySidebar() {
    return (
        <aside className="company-sidebar">

            <div className="company-logo">
                Student<span>Placement</span>
            </div>

            <nav className="company-menu">

                <Link to="/company/dashboard">
                    Dashboard
                </Link>

                <Link to="/company/profile">
                    Company Profile
                </Link>

                <Link to="/company/jobs">
                    Job Openings
                </Link>

                <Link to="/company/applications">
                    Applications
                </Link>

                <Link to="/company/candidates">
                    Candidates
                </Link>

                <Link to="/company/interviews">
                    Interviews
                </Link>

                <Link to="/company/placements">
                    Hiring History
                </Link>

                <Link to="/company/settings">
                    Settings
                </Link>

            </nav>

            <div className="company-logout">
                <button>Logout</button>
            </div>

        </aside>
    );
}

export default CompanySidebar;