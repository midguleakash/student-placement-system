
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";

function CompanyDashboard() {
    const { profile } = useCompanyProfile();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [dataError, setDataError] = useState("");

    const status = profile?.profileStatus || "INCOMPLETE";
    const approved = status === "APPROVED";

    useEffect(() => {
        let cancelled = false;

        async function loadRecruitmentData() {
            if (!approved) {
                setJobs([]);
                setApplications([]);
                return;
            }

            try {
                const [jobResult, applicationResult] = await Promise.all([
                    companyApi.getMyJobs(),
                    companyApi.getMyApplications(),
                ]);

                if (cancelled) return;

                setJobs(
                    Array.isArray(jobResult)
                        ? jobResult
                        : jobResult.jobs || []
                );

                setApplications(
                    Array.isArray(applicationResult)
                        ? applicationResult
                        : applicationResult.applications || []
                );

                setDataError("");
            } catch (err) {
                if (!cancelled) {
                    setDataError(
                        err.message || "Unable to load recruitment statistics."
                    );
                }
            }
        }

        loadRecruitmentData();

        return () => {
            cancelled = true;
        };
    }, [approved]);

    const requiredFields = [
        profile?.companyName,
        profile?.industry,
        profile?.website,
        profile?.contactPerson,
        profile?.phone,
        profile?.companyEmail,
        profile?.address,
        profile?.description,
    ];

    const completed = requiredFields.filter(
        (value) => value != null && String(value).trim() !== ""
    ).length;

    const completion = Math.round(
        (completed / requiredFields.length) * 100
    );

    const statusContent = {
        INCOMPLETE: {
            title: "Complete your company profile",
            description:
                "Add your company details and submit them for admin approval.",
            action: "Complete Profile",
        },
        PENDING: {
            title: "Your profile is under review",
            description:
                "The admin is reviewing your company details. Job posting is disabled until approval.",
            action: "View Profile",
        },
        REJECTED: {
            title: "Your profile needs changes",
            description:
                profile?.rejectionRemarks ||
                "Review the profile and resubmit it for approval.",
            action: "Update Profile",
        },
        APPROVED: {
            title: "Your company is approved",
            description:
                "You can now create job openings and manage applicants.",
            action: "View Profile",
        },
    };

    const current = statusContent[status] || statusContent.INCOMPLETE;

    return (
        <div className="company-content">
            <section className="company-welcome">
                <div>
                    <span className="company-kicker">
                        RECRUITMENT OVERVIEW
                    </span>

                    <h1>
                        Welcome, {profile?.companyName || "Company"}!
                    </h1>

                    <p>
                        Manage your company profile and prepare for campus
                        recruitment.
                    </p>
                </div>

                <div className="welcome-illustration">
                    <span>✦</span>
                    <strong>Build your team</strong>
                    <small>Connect with future talent</small>
                </div>
            </section>

            <section className={`company-approval-panel ${status.toLowerCase()}`}>
                <div className="approval-icon">
                    {approved ? "✓" : status === "REJECTED" ? "!" : "◷"}
                </div>

                <div className="approval-copy">
                    <StatusBadge status={status} />
                    <h3>{current.title}</h3>
                    <p>{current.description}</p>
                </div>

                <Link to="/company/profile" className="company-button primary">
                    {current.action}
                </Link>
            </section>

            {dataError && (
                <div className="company-alert error" role="alert">
                    {dataError}
                </div>
            )}

            <section className="company-stats-grid">
                <article className="company-stat-card">
                    <div className="stat-card-top">
                        <span>Profile Completion</span>
                        <span className="stat-icon purple">▤</span>
                    </div>

                    <strong>{completion}%</strong>

                    <div className="completion-track">
                        <div style={{ width: `${completion}%` }} />
                    </div>

                    <small>Company information completed</small>
                </article>

                <article className="company-stat-card">
                    <div className="stat-card-top">
                        <span>Job Openings</span>
                        <span className="stat-icon blue">▣</span>
                    </div>

                    <strong>{approved ? jobs.length : "—"}</strong>
                    <small>
                        {approved
                            ? "Jobs managed by your company"
                            : "Available after approval"}
                    </small>
                </article>

                <article className="company-stat-card">
                    <div className="stat-card-top">
                        <span>Applications</span>
                        <span className="stat-icon orange">♙</span>
                    </div>

                    <strong>{approved ? applications.length : "—"}</strong>
                    <small>
                        {approved
                            ? "Applications received"
                            : "Available after approval"}
                    </small>
                </article>
            </section>

            <section className="company-section">
                <div className="company-section-heading">
                    <div>
                        <h2>Recruitment workspace</h2>
                        <p>
                            {approved
                                ? "Manage your jobs and applicants."
                                : "Complete the approval process to unlock recruitment."}
                        </p>
                    </div>
                </div>

                <div className="company-feature-grid">
                    <article className={`company-feature-card ${!approved ? "locked" : ""}`}>
                        <div className="feature-icon blue">▣</div>
                        <h3>Job Openings</h3>
                        <p>
                            Publish job descriptions and define eligibility
                            criteria for students.
                        </p>

                        {approved ? (
                            <Link to="/company/jobs" className="company-text-link">
                                Manage jobs →
                            </Link>
                        ) : (
                            <span className="feature-locked-label">
                                🔒 Locked until approval
                            </span>
                        )}
                    </article>

                    <article className={`company-feature-card ${!approved ? "locked" : ""}`}>
                        <div className="feature-icon orange">♙</div>
                        <h3>Applicants</h3>
                        <p>
                            Review applications and manage recruitment
                            decisions.
                        </p>

                        {approved ? (
                            <Link
                                to="/company/applications"
                                className="company-text-link"
                            >
                                View applicants →
                            </Link>
                        ) : (
                            <span className="feature-locked-label">
                                🔒 Locked until approval
                            </span>
                        )}
                    </article>

                    <article className="company-feature-card">
                        <div className="feature-icon purple">▤</div>
                        <h3>Company Profile</h3>
                        <p>
                            Update company details and check approval status.
                        </p>
                        <Link
                            to="/company/profile"
                            className="company-text-link"
                        >
                            Open profile →
                        </Link>
                    </article>
                </div>
            </section>

            {approved && (
                <section className="company-section">
                    <div className="company-section-heading">
                        <div>
                            <h2>Recent job openings</h2>
                            <p>Latest jobs managed by your company.</p>
                        </div>
                        <Link to="/company/jobs" className="company-text-link">
                            View all →
                        </Link>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="company-empty-state">
                            <span>▣</span>
                            <h3>No job openings yet</h3>
                            <p>
                                Create your first job opening when the job
                                management form is available.
                            </p>
                            <Link
                                to="/company/jobs"
                                className="company-button primary"
                            >
                                Open Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="company-data-list">
                            {jobs.slice(0, 5).map((job) => (
                                <div
                                    className="company-data-row"
                                    key={job.id || job.jobId}
                                >
                                    <div>
                                        <strong>
                                            {job.title || job.jobTitle}
                                        </strong>
                                        <small>
                                            {job.location || "Location not specified"}
                                        </small>
                                    </div>

                                    <StatusBadge
                                        status={job.status || "PUBLISHED"}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default CompanyDashboard;
