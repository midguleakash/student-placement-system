
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../services/studentApi";

function StudentApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await studentApi.getMyApplications();

            setApplications(
                Array.isArray(result) ? result : result?.content ?? []
            );
        } catch (err) {
            setError(
                err.message || "Unable to load your applications."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString();
    }

    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">
                        APPLICATION TRACKER
                    </span>
                    <h1>My Applications</h1>
                    <p>
                        Track the jobs you have applied for and their
                        current status.
                    </p>
                </div>
            </section>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <section className="overview-card">
                <div className="job-page-actions">
                    <h2>Your Applications ({applications.length})</h2>
                    <button
                        className="button button-secondary"
                        onClick={loadApplications}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p>Loading applications...</p>
                ) : applications.length === 0 ? (
                    <>
                        <p>You have not applied for any jobs yet.</p>
                        <Link
                            className="button button-primary"
                            to="/student/jobs"
                        >
                            Browse Jobs
                        </Link>
                    </>
                ) : (
                    <div className="student-job-list">
                        {applications.map((application) => {
                            const applicationId =
                                application.id ?? application.applicationId;

                            const job = application.job ?? {};
                            const title =
                                application.jobTitle ??
                                job.title ??
                                application.title ??
                                "Job title unavailable";

                            const status = String(
                                application.status ??
                                application.applicationStatus ??
                                "PENDING"
                            ).toUpperCase();

                            return (
                                <article
                                    className="student-job-card"
                                    key={applicationId ?? `${application.jobId}-${application.studentUserId}`}
                                >
                                    <h3>{title}</h3>

                                    <p>
                                        <strong>Company:</strong>{" "}
                                        {application.companyName ??
                                            job.companyName ??
                                            "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Applied on:</strong>{" "}
                                        {formatDate(
                                            application.appliedAt ??
                                            application.createdAt
                                        )}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        <span
                                            className={`application-status status-${status.toLowerCase()}`}
                                        >
                                            {status.replaceAll("_", " ")}
                                        </span>
                                    </p>

                                    {(application.statusRemarks || application.remarks) && (
                                        <p>
                                            <strong>Remarks:</strong>{" "}
                                            {application.statusRemarks || application.remarks}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}


            </section>
        </div>
    );
}

export default StudentApplications;
