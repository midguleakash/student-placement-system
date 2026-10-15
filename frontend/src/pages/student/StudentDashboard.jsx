
import { Link } from "react-router-dom";
import { useStudentProfile } from "../../context/StudentProfileContext";
import StatusBadge from "../../components/student/StatusBadge";

function StudentDashboard() {
    const { profile, loading, error } = useStudentProfile();

    if (loading) {
        return <div className="page-loading">Loading your dashboard...</div>;
    }

    const status = profile?.profileStatus || "INCOMPLETE";
    const approved = status === "APPROVED";
    const rejected = status === "REJECTED";
    const pending = status === "PENDING";

    const requiredFields = [
        profile?.firstName,
        profile?.lastName,
        profile?.phone,
        profile?.branch,
        profile?.graduationYear,
        profile?.cgpa,
        profile?.activeBacklogs,
        profile?.skills,
        profile?.resumeUrl,
    ];

    const completed = requiredFields.filter(
        value => value !== null && value !== undefined &&
            String(value).trim() !== ""
    ).length;

    const percentage = Math.round(
        (completed / requiredFields.length) * 100
    );

    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">STUDENT OVERVIEW</span>
                    <h1>
                        Welcome{profile?.firstName
                            ? `, ${profile.firstName}`
                            : " to your portal"}
                    </h1>
                    <p>
                        {pending
                            ? "Your profile is submitted and awaiting admin approval. Placement opportunities will unlock once approved."
                            : rejected
                                ? "Your profile needs changes. Review the admin remarks and update your details."
                                : approved
                                    ? "Your profile is approved. Explore job openings and manage your placement applications."
                                    : "Complete your student profile and submit it for admin approval to access placement opportunities."}
                    </p>
                </div>

                <div className="welcome-status">
                    <StatusBadge status={status} />
                </div>
            </section>

            {error && (
                <div className="notice notice-error">
                    {error}
                </div>
            )}

            {!approved && (
                <section className="notice-panel">
                    <div className="notice-icon">
                        {pending ? "◷" : rejected ? "!" : "✓"}
                    </div>

                    <div className="notice-copy">
                        <h3>
                            {pending
                                ? "Your profile is under review"
                                : rejected
                                    ? "Profile changes required"
                                    : "Complete your profile first"}
                        </h3>

                        <p>
                            {pending
                                ? "Your profile has been submitted. Placement features will unlock after admin approval."
                                : rejected
                                    ? "Please review the admin remarks, update your details, and submit again."
                                    : "Fill in all required details and submit your profile for admin approval."}
                        </p>

                        {rejected && profile?.rejectionRemarks && (
                            <p>
                                <strong>Admin remarks:</strong>{" "}
                                {profile.rejectionRemarks}
                            </p>
                        )}

                        {!pending && (
                            <Link
                                className="button button-primary"
                                to="/student/profile"
                            >
                                {rejected
                                    ? "Update Profile"
                                    : "Complete Profile"}
                            </Link>
                        )}

                        {pending && (
                            <Link
                                className="button button-secondary"
                                to="/student/profile"
                            >
                                View Submitted Profile
                            </Link>
                        )}
                    </div>
                </section>
            )}

            {approved && (
                <section className="notice-panel notice-approved">
                    <div className="notice-icon">✓</div>
                    <div className="notice-copy">
                        <h3>Your profile is approved!</h3>
                        <p>
                            You can now browse job openings and apply
                            to eligible placements.
                        </p>
                        <Link
                            className="button button-primary"
                            to="/student/jobs"
                        >
                            Explore Jobs
                        </Link>
                    </div>
                </section>
            )}

            <section className="stats-grid">
                <article className="stat-card">
                    <span className="stat-icon blue">♙</span>
                    <p>Profile completion</p>
                    <h2>{percentage}%</h2>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </article>

                <article className="stat-card">
                    <span className="stat-icon purple">▤</span>
                    <p>Job openings</p>
                    <h2>{approved ? "Explore" : "Locked"}</h2>
                    <span className="stat-footnote">
                        {approved
                            ? "Browse available jobs"
                            : "Available after approval"}
                    </span>
                </article>

                <article className="stat-card">
                    <span className="stat-icon green">↗</span>
                    <p>Applications</p>
                    <h2>{approved ? "Available" : "Locked"}</h2>
                    <span className="stat-footnote">
                        {approved
                            ? "Track your applications"
                            : "Approval required"}
                    </span>
                </article>
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h2>Profile overview</h2>
                        <p>Your details and approval status</p>
                    </div>

                    <Link to="/student/profile" className="text-link">
                        View profile →
                    </Link>
                </div>

                <div className="overview-card">
                    <div className="overview-row">
                        <span>Student name</span>
                        <strong>
                            {[profile?.firstName, profile?.lastName]
                                .filter(Boolean).join(" ") || "Not provided"}
                        </strong>
                    </div>

                    <div className="overview-row">
                        <span>Branch</span>
                        <strong>{profile?.branch || "Not provided"}</strong>
                    </div>

                    <div className="overview-row">
                        <span>Graduation year</span>
                        <strong>
                            {profile?.graduationYear || "Not provided"}
                        </strong>
                    </div>

                    <div className="overview-row">
                        <span>CGPA</span>
                        <strong>{profile?.cgpa ?? "Not provided"}</strong>
                    </div>

                    <div className="overview-row">
                        <span>Profile status</span>
                        <StatusBadge status={status} />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default StudentDashboard;
