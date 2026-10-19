
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useCompanyProfile } from "../../context/CompanyProfileContext";
import { companyApi } from "../../services/companyApi";
import StatusBadge from "../../components/company/StatusBadge";
import "./CompanyDashboard.css";

const initialFilters = {
    title: "",
    status: "",
    location: "",
    workMode: "",
    requiredSkills: "",
    minimumSalary: "",
    maximumSalary: "",
    deadlineFrom: "",
    deadlineTo: "",
};

const statuses = ["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"];
const workModes = ["ONSITE", "HYBRID", "REMOTE"];

function CompanyJobs() {
    const { profile } = useCompanyProfile();

    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);
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

            setJobs(
                Array.isArray(result)
                    ? result
                    : Array.isArray(result?.jobs)
                        ? result.jobs
                        : []
            );
        } catch (err) {
            setError(err.message || "Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    }, [approved]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    function updateFilter(event) {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function resetFilters() {
        setFilters({ ...initialFilters });
    }

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const title = String(job.title ?? job.jobTitle ?? "");
            const location = String(job.location ?? "");
            const skills = String(job.requiredSkills ?? "");
            const status = String(job.status ?? "DRAFT").toUpperCase();
            const workMode = String(job.workMode ?? "").toUpperCase();

            const salary =
                job.salary == null || job.salary === ""
                    ? null
                    : Number(job.salary);

            const deadlineValue =
                job.applicationDeadline ?? job.deadline ?? "";

            const deadline = deadlineValue
                ? String(deadlineValue).slice(0, 10)
                : "";

            return (
                title.toLowerCase().includes(
                    filters.title.trim().toLowerCase()
                ) &&
                (!filters.status || status === filters.status) &&
                location.toLowerCase().includes(
                    filters.location.trim().toLowerCase()
                ) &&
                (!filters.workMode || workMode === filters.workMode) &&
                skills.toLowerCase().includes(
                    filters.requiredSkills.trim().toLowerCase()
                ) &&
                (
                    !filters.minimumSalary ||
                    (
                        salary !== null &&
                        Number.isFinite(salary) &&
                        salary >= Number(filters.minimumSalary)
                    )
                ) &&
                (
                    !filters.maximumSalary ||
                    (
                        salary !== null &&
                        Number.isFinite(salary) &&
                        salary <= Number(filters.maximumSalary)
                    )
                ) &&
                (
                    !filters.deadlineFrom ||
                    (deadline && deadline >= filters.deadlineFrom)
                ) &&
                (
                    !filters.deadlineTo ||
                    (deadline && deadline <= filters.deadlineTo)
                )
            );
        });
    }, [jobs, filters]);

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
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>

                    <Link
                        to="/company/jobs/new"
                        className="company-button primary"
                    >
                        + Create Job
                    </Link>
                </div>
            </div>

            {error && (
                <div className="company-alert error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className="company-alert success" role="status">
                    {message}
                </div>
            )}

            <section className="company-job-filters">
                <div className="company-job-filter-heading">
                    <div>
                        <h2>Search and Filter Jobs</h2>

                        <p>
                            Find jobs by title, status, location, salary,
                            skills, and deadline.
                        </p>
                    </div>

                    <div className="company-job-filter-actions">
                        <button
                            type="button"
                            className="company-button company-filter-toggle"
                            onClick={() =>
                                setShowFilters((previous) => !previous)
                            }
                            aria-expanded={showFilters}
                            aria-controls="company-job-filter-fields"
                        >
                            {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
                        </button>

                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div
                        className="company-job-filter-grid"
                        id="company-job-filter-fields"
                    >
                        <label>
                            Job title
                            <input
                                name="title"
                                value={filters.title}
                                onChange={updateFilter}
                                placeholder="Search job title"
                            />
                        </label>

                        <label>
                            Status
                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                            >
                                <option value="">All statuses</option>

                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Location
                            <input
                                name="location"
                                value={filters.location}
                                onChange={updateFilter}
                                placeholder="e.g. Pune"
                            />
                        </label>

                        <label>
                            Work mode
                            <select
                                name="workMode"
                                value={filters.workMode}
                                onChange={updateFilter}
                            >
                                <option value="">All work modes</option>

                                {workModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Required skills
                            <input
                                name="requiredSkills"
                                value={filters.requiredSkills}
                                onChange={updateFilter}
                                placeholder="e.g. Java, SQL"
                            />
                        </label>

                        <label>
                            Minimum salary
                            <input
                                type="number"
                                min="0"
                                name="minimumSalary"
                                value={filters.minimumSalary}
                                onChange={updateFilter}
                                placeholder="Minimum"
                            />
                        </label>

                        <label>
                            Maximum salary
                            <input
                                type="number"
                                min="0"
                                name="maximumSalary"
                                value={filters.maximumSalary}
                                onChange={updateFilter}
                                placeholder="Maximum"
                            />
                        </label>

                        <label>
                            Deadline from
                            <input
                                type="date"
                                name="deadlineFrom"
                                value={filters.deadlineFrom}
                                onChange={updateFilter}
                            />
                        </label>

                        <label>
                            Deadline to
                            <input
                                type="date"
                                name="deadlineTo"
                                value={filters.deadlineTo}
                                onChange={updateFilter}
                                min={filters.deadlineFrom || undefined}
                            />
                        </label>
                    </div>
                )}

                <div className="company-job-filter-count">
                    <span>
                        Showing {filteredJobs.length} of {jobs.length} jobs
                    </span>

                    {showFilters && (
                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            </section>

            {loading ? (
                <p>Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
                <div className="company-empty-state">
                    <h3>
                        {jobs.length === 0
                            ? "No jobs created yet"
                            : "No jobs match your filters"}
                    </h3>

                    <p>
                        {jobs.length === 0
                            ? "Create your first job opening to get started."
                            : "Try different filters or clear them to see all your jobs."}
                    </p>

                    {jobs.length === 0 ? (
                        <Link
                            to="/company/jobs/new"
                            className="company-button primary"
                        >
                            Create Job
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="company-button"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="company-data-list">
                    {filteredJobs.map((job) => {
                        const id = job.id ?? job.jobId;
                        const status = String(
                            job.status ?? "DRAFT"
                        ).toUpperCase();

                        const isDraft = status === "DRAFT";

                        return (
                            <article
                                className="company-data-row"
                                key={id}
                            >
                                <div className="job-row-details">
                                    <h3>{job.title ?? job.jobTitle}</h3>

                                    <p>
                                        {job.location ||
                                            "Location not specified"}
                                    </p>

                                    <p>
                                        Work mode: {job.workMode || "—"}
                                    </p>

                                    <p>
                                        Required skills:{" "}
                                        {job.requiredSkills || "—"}
                                    </p>

                                    <p>
                                        Salary: {job.salary ?? "—"}
                                    </p>

                                    <p>
                                        Vacancies: {job.vacancies ?? "—"}
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

                                    {isDraft && (
                                        <Link
                                            to={`/company/jobs/${id}/edit`}
                                            className="company-button"
                                        >
                                            Edit
                                        </Link>
                                    )}

                                    {isDraft && (
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
                                            {busyId === id
                                                ? "Processing..."
                                                : "Close Job"}
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
