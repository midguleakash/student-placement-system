
import { Link } from "react-router-dom";

function StudentApplications() {
    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">APPLICATION TRACKER</span>
                    <h1>My Applications</h1>
                    <p>
                        Track the status of your placement applications.
                    </p>
                </div>
            </section>

            <section className="overview-card">
                <h2>Your applications</h2>
                <p>
                    Connect this page to your Placement Service API to show
                    submitted applications and their statuses.
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

export default StudentApplications;
