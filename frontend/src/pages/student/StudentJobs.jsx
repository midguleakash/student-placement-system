
import { Link } from "react-router-dom";

function StudentJobs() {
    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">CAREER OPPORTUNITIES</span>
                    <h1>Job Openings</h1>
                    <p>
                        Browse jobs for which you meet the eligibility criteria.
                    </p>
                </div>
            </section>

            <section className="overview-card">
                <h2>Job listings</h2>
                <p>
                    Connect this page to your Placement Service API to display
                    available jobs.
                </p>
                <Link
                    className="button button-secondary"
                    to="/student/dashboard"
                >
                    Back to Dashboard
                </Link>
            </section>
        </div>
    );
}

export default StudentJobs;
