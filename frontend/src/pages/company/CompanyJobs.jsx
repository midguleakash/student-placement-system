
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";

function CompanyJobs() {
    const { profile } = useCompanyProfile();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const approved = profile?.profileStatus === "APPROVED";

    const loadJobs = useCallback(async () => {
        if (!approved) {
            setJobs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await companyApi.getMyJobs();
            setJobs(Array.isArray(result) ? result : result.jobs || []);
        } catch (err) {
            setError(err.message || "Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    }, [approved]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    async function performAction(jobId, action, successMessage) {
        setBusyId(jobId);
        setError("");
        setMessage("");

        try {
            await action(jobId);
            setMessage(successMessage);
            await loadJobs();
        } catch (err) {
            setError(err.message || "Unable to update job.");
        } finally {
            setBusyId(null);
        }
    }

    if (!approved) {
        return (
            <section className="company-profile-page">
                <div className="company-page-state">
                    <div className="company-state-icon">🔒</div>
                    <h1>Job posting is locked</h1>
                    <p>
                        Complete your company profile and receive admin
                        approval before managing job openings.
                    </p>
                    <StatusBadge status={profile?.profileStatus} />
                    <Link
                        to="/company/profile"
                        className="company-button primary"
                    >
                        View Company Profile
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="company-profile-page">
            <div className="company-page-title">
                <div>
                    <span className="company-kicker">RECRUITMENT</span>
                    <h1>My Job Openings</h1>
                    <p>
                        Create jobs and manage opportunities posted by
                        your company.
                    </p>
                </div>

                <div className="job-page-actions">
                    <button
                        type="button"
                        className="company-button"
                        onClick={loadJobs}
                    >
                        Refresh
                    </button>

                    <Link
                        to="/company/jobs/new"
                        className="company-button primary"
                    >
                        + Create Job
                    </Link>
                </div>
            </div>

            {error && <div className="company-alert error">{error}</div>}
            {message && <div className="company-alert success">{message}</div>}

            {loading ? (
                <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
                <div className="company-empty-state">
                    <h3>No jobs created yet</h3>
                    <p>Create your first job opening to get started.</p>
                    <Link
                        to="/company/jobs/new"
                        className="company-button primary"
                    >
                        Create Job
                    </Link>
                </div>
            ) : (
                <div className="company-data-list">
                    {jobs.map((job) => {
                        const id = job.id ?? job.jobId;
                        const status = job.status ?? "DRAFT";

                        return (
                            <article className="company-data-row" key={id}>
                                <div className="job-row-details">
                                    <h3>{job.title ?? job.jobTitle}</h3>

                                    <p>
                                        {job.location ||
                                            "Location not specified"}
                                    </p>

                                    <p>
                                        Deadline:{" "}
                                        {job.applicationDeadline
                                            ? new Date(
                                                  job.applicationDeadline
                                              ).toLocaleString()
                                            : job.deadline
                                              ? new Date(
                                                    job.deadline
                                                ).toLocaleString()
                                              : "Not provided"}
                                    </p>

                                    <p>
                                        Applications:{" "}
                                        {job.applicationCount ?? "—"}
                                    </p>
                                </div>

                                <div className="job-row-actions">
                                    <StatusBadge status={status} />

                                    <Link
                                        to={`/company/jobs/${id}/edit`}
                                        className="company-button"
                                    >
                                        Edit
                                    </Link>

                                    {status === "DRAFT" && (
                                        <button
                                            type="button"
                                            className="company-button primary"
                                            disabled={busyId === id}
                                            onClick={() =>
                                                performAction(
                                                    id,
                                                    companyApi.publishJob,
                                                    "Job published successfully."
                                                )
                                            }
                                        >
                                            {busyId === id
                                                ? "Processing..."
                                                : "Publish"}
                                        </button>
                                    )}

                                    {status === "PUBLISHED" && (
                                        <button
                                            type="button"
                                            className="company-button"
                                            disabled={busyId === id}
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        "Close this job? Students will no longer be able to apply."
                                                    )
                                                ) {
                                                    performAction(
                                                        id,
                                                        companyApi.closeJob,
                                                        "Job closed successfully."
                                                    );
                                                }
                                            }}
                                        >
                                            Close Job
                                        </button>
                                    )}

                                    <Link
                                        to={`/company/applications?jobId=${id}`}
                                        className="company-button"
                                    >
                                        View Applicants
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default CompanyJobs;
