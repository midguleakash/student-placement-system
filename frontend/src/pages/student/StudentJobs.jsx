
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../services/studentApi";

function StudentJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [applyingId, setApplyingId] = useState(null);
    const [accessAllowed, setAccessAllowed] = useState(false);
    const [accessMessage, setAccessMessage] = useState("");

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError("");
        setAccessMessage("");

        try {
            const [profile, registration] = await Promise.all([
                studentApi.getMyProfile(),
                studentApi.getPlacementRegistration(),
            ]);

            const profileStatus = String(
                profile?.profileStatus ?? ""
            ).toUpperCase();

            const registrationStatus = String(
                registration?.placementRegistrationStatus ??
                registration?.status ??
                ""
            ).toUpperCase();

            if (profileStatus !== "APPROVED") {
                setAccessAllowed(false);
                setAccessMessage(
                    "Your student profile must be approved before you can access job openings."
                );
                setJobs([]);
                return;
            }

            if (registrationStatus !== "APPROVED") {
                setAccessAllowed(false);
                setAccessMessage(
                    "Your placement registration must be approved before you can access job openings."
                );
                setJobs([]);
                return;
            }

            setAccessAllowed(true);

            const result = await studentApi.getEligibleJobs();
            setJobs(Array.isArray(result) ? result : result?.content ?? []);
        } catch (err) {
            setError(err.message || "Unable to load job openings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    async function handleApply(jobId) {
        const confirmed = window.confirm(
            "Are you sure you want to apply for this job?"
        );

        if (!confirmed) return;

        setApplyingId(jobId);
        setError("");
        setMessage("");

        try {
            await studentApi.applyForJob(jobId);
            setMessage("Application submitted successfully.");
            await loadJobs();
        } catch (err) {
            setError(err.message || "Unable to submit your application.");
        } finally {
            setApplyingId(null);
        }
    }

    function formatDate(value) {
        if (!value) return "Not specified";

        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleString();
    }

    return (
        <div className="student-page">
            <section className="welcome-panel">
                <div>
                    <span className="section-kicker">
                        CAREER OPPORTUNITIES
                    </span>
                    <h1>Job Openings</h1>
                    <p>
                        Browse published jobs and apply for positions
                        that match your eligibility.
                    </p>
                </div>
            </section>

            {message && (
                <div className="success-message" role="status">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <section className="overview-card">
                    <p>Loading job openings...</p>
                </section>
            ) : !accessAllowed ? (
                <section className="overview-card">
                    <h2>Approval required</h2>
                    <p>{accessMessage}</p>
                    <Link
                        className="button button-secondary"
                        to="/student/dashboard"
                    >
                        Back to Dashboard
                    </Link>
                </section>
            ) : jobs.length === 0 ? (
                <section className="overview-card">
                    <h2>No eligible jobs available</h2>
                    <p>
                        There are currently no published jobs available
                        for your profile.
                    </p>
                    <button
                        className="button button-secondary"
                        onClick={loadJobs}
                    >
                        Refresh Jobs
                    </button>
                </section>
            ) : (
                <section className="overview-card">
                    <div className="job-page-actions">
                        <h2>Available Jobs ({jobs.length})</h2>
                        <button
                            className="button button-secondary"
                            onClick={loadJobs}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="student-job-list">
                        {jobs.map((job) => {
                            const jobId = job.id ?? job.jobId;

                            return (
                                <article
                                    className="student-job-card"
                                    key={jobId}
                                >
                                    <div>
                                        <h3>{job.title ?? job.jobTitle}</h3>
                                        <p>
                                            {job.location || "Location not specified"}
                                            {" · "}
                                            {job.workMode || "Work mode not specified"}
                                        </p>
                                    </div>

                                    <p>{job.description}</p>

                                    <p>
                                        <strong>Required skills:</strong>{" "}
                                        {job.requiredSkills || "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Minimum CGPA:</strong>{" "}
                                        {job.minimumCgpa ?? "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Maximum active backlogs:</strong>{" "}
                                        {job.maximumActiveBacklogs ?? "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Eligible graduation years:</strong>{" "}
                                        {job.eligibleGraduationYears || "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Salary:</strong>{" "}
                                        {job.salary != null
                                            ? job.salary
                                            : "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Vacancies:</strong>{" "}
                                        {job.vacancies ?? "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Application deadline:</strong>{" "}
                                        {formatDate(job.applicationDeadline)}
                                    </p>

                                    <button
                                        className="button button-primary"
                                        disabled={
                                            !jobId ||
                                            applyingId === jobId ||
                                            job.status !== "PUBLISHED"
                                        }
                                        onClick={() => handleApply(jobId)}
                                    >
                                        {applyingId === jobId
                                            ? "Applying..."
                                            : "Apply Now"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}

export default StudentJobs;
