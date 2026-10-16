
import { Link } from "react-router-dom";
import { useStudentProfile } from "../../context/StudentProfileContext";
import StatusBadge from "../../components/student/StatusBadge";

function StudentDashboard() {
    const { profile, loading, error } = useStudentProfile();

    if (loading) {
        return <div className="page-loading">Loading your dashboard...</div>;
    }

    const status = profile?.profileStatus || "INCOMPLETE";
    const profileApproved = status === "APPROVED";
    const rejected = status === "REJECTED";
    const pending = status === "PENDING";

    const registrationStatus =
        profile?.placementRegistrationStatus || "NOT_REGISTERED";

    const registrationApproved = registrationStatus === "APPROVED";
    const registrationPending = registrationStatus === "PENDING";
    const registrationRejected = registrationStatus === "REJECTED";

    const approved = profileApproved && registrationApproved;
    const requiredFields = [
        profile?.firstName,
        profile?.lastName,
        profile?.phone,
        profile?.branch,
        profile?.graduationYear,
        profile?.cgpa,
        profile?.activeBacklogs,
        profile?.skills,
    ];

    const completed = requiredFields.filter(
        value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
    ).length + (profile?.hasResume === true ? 1 : 0);

    const percentage = Math.round((completed / 9) * 100);

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
                        {!profileApproved
                            ? pending
                                ? "Your profile is awaiting admin approval."
                                : rejected
                                    ? "Your profile needs changes. Review the admin remarks and update your details."
                                    : "Complete your student profile and submit it for approval."
                            : registrationApproved
                                ? "Your profile and placement registration are approved. You can explore eligible jobs and manage applications."
                                : registrationPending
                                    ? "Your profile is approved. Your placement registration is awaiting admin approval."
                                    : registrationRejected
                                        ? "Your placement registration was rejected. Review the admin remarks and register again."
                                        : "Your profile is approved. Register for placement to unlock jobs and applications."}
                    </p>

                    {registrationRejected && profile?.placementRejectionRemarks && (
                        <p>
                            <strong>Admin remarks:</strong>{" "}
                            {profile.placementRejectionRemarks}
                        </p>
                    )}

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

            {!profileApproved && (
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


            {profileApproved && !registrationApproved && (
                <section className="notice-panel">
                    <div className="notice-icon">
                        {registrationPending ? "◷" : registrationRejected ? "!" : "✓"}
                    </div>

                    <div className="notice-copy">
                        <h3>
                            {registrationPending
                                ? "Placement registration under review"
                                : registrationRejected
                                    ? "Placement registration rejected"
                                    : "Register for placements"}
                        </h3>

                        <p>
                            {registrationPending
                                ? "Wait for admin approval. Jobs and applications remain locked."
                                : registrationRejected
                                    ? "Review the admin remarks and submit your registration again."
                                    : "Your profile is approved. Register for placements to request access to jobs and applications."}
                        </p>

                        {!registrationPending && (
                            <Link
                                className="button button-primary"
                                to="/student/placement-registration"
                            >
                                {registrationRejected
                                    ? "Review and Register Again"
                                    : "Register for Placement"}
                            </Link>
                        )}
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
